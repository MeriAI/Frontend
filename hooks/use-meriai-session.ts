"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MeriAiClient } from "@/lib/adapters/meriai-client";
import { parseMeriAiEvent, parseSessionSnapshot, type ActivityEntry, type BrowserActionPreview, type Checklist, type MeriAiService, type MissingQuestion, type Research, type SessionSnapshot } from "@/lib/contracts/meriai";
import { createMessage } from "@/features/studio/fixtures";
import type { ApiError } from "@/lib/api/errors";
import type { Message } from "@/types/studio";

function playAudio(audioBase64: string, mimeType: string) {
  const bytes = Uint8Array.from(atob(audioBase64), (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const audio = new Audio(url);
  audio.onended = audio.onerror = () => URL.revokeObjectURL(url);
  void audio.play().catch(() => URL.revokeObjectURL(url));
}

export function useMeriAiSession(language: string, mode: string, welcome: string, isMuted: boolean) {
  const clientRef = useRef<MeriAiClient | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sequenceRef = useRef(-1);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordedBytesRef = useRef(0);
  const activeVoiceTurnRef = useRef<string | null>(null);
  const sessionConfigRef = useRef<{ language: string; mode: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => [createMessage("ai", welcome)]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);
  const [statusReason, setStatusReason] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [research, setResearch] = useState<Research | null>(null);
  const [actionPreview, setActionPreview] = useState<BrowserActionPreview | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [services, setServices] = useState<MeriAiService[]>([]);
  const [missingQuestions, setMissingQuestions] = useState<MissingQuestion[]>([]);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const client = useCallback(() => (clientRef.current ??= new MeriAiClient()), []);
  const applySnapshot = useCallback((snapshot: SessionSnapshot | undefined) => {
    if (!snapshot) return;
    if (snapshot.checklist) setChecklist(snapshot.checklist);
    if (snapshot.actionProposal) setActionPreview(snapshot.actionProposal);
    setMissingQuestions(snapshot.missingQuestions);
  }, []);
  const handlePayload = useCallback((payload: unknown) => {
    const candidates = Array.isArray(payload) ? payload : [payload];
    for (const candidate of candidates) {
      const parsed = parseMeriAiEvent(candidate);
      if (!parsed.ok) {
        applySnapshot(parseSessionSnapshot(candidate));
        continue;
      }
      if (parsed.value.sequence !== undefined && parsed.value.sequence <= sequenceRef.current) continue;
      if (parsed.value.sequence !== undefined) sequenceRef.current = parsed.value.sequence;
      const event = parsed.value;
      if (event.type === "session.ready") applySnapshot(event.snapshot);
      if (event.type === "assistant.message") { setMessages((current) => [...current, { ...createMessage("ai", event.text), verified: event.verified }]); setResearch(event.research ?? null); applySnapshot(event.snapshot); setIsProcessing(false); }
      if (event.type === "checklist.updated") { setChecklist(event.checklist); applySnapshot(event.snapshot); }
      if (event.type === "transcript.final") setTranscript(event.text);
      if (event.type === "speech.output" && !isMuted && event.status && event.audioBase64 && event.mimeType) playAudio(event.audioBase64, event.mimeType);
      if (event.type === "status") { setIsVoiceAvailable(event.status !== "text_only"); setStatusReason(event.status === "text_only" ? event.reasonCode ?? "text_only" : null); }
      if (event.type === "action.result") {
        const entry = event.entry;
        if (entry) setActivity((current) => [...current, entry]);
        applySnapshot(event.snapshot);
      }
      if (event.type === "error") { setIsProcessing(false); setError(new Error(`The request could not be completed (${event.code}).`)); }
    }
  }, [applySnapshot, isMuted]);
  const connect = useCallback(async (): Promise<void> => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    if (socketRef.current?.readyState === WebSocket.CONNECTING) {
      await new Promise<void>((resolve, reject) => {
        socketRef.current?.addEventListener("open", () => resolve(), { once: true });
        socketRef.current?.addEventListener("error", () => reject(new Error("WebSocket connection failed.")), { once: true });
      });
      return;
    }
    sequenceRef.current = -1;
    await client().getSessionState(sessionId).then(handlePayload).catch(() => undefined);
    const socket = new WebSocket(client().webSocketUrl(sessionId));
    socketRef.current = socket;
    socket.onmessage = (event) => { try { handlePayload(JSON.parse(String(event.data))); } catch { /* binary server frames are not part of the documented protocol */ } };
    socket.onclose = () => { if (sessionIdRef.current === sessionId) reconnectRef.current = setTimeout(() => { void connect().catch(() => undefined); }, 1_000); };
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener("open", () => resolve(), { once: true });
      socket.addEventListener("error", () => reject(new Error("WebSocket connection failed.")), { once: true });
    });
    socket.send(JSON.stringify({ type: "session.start" }));
  }, [client, handlePayload]);
  const ensureSession = useCallback(async () => {
    if (sessionIdRef.current && sessionConfigRef.current?.language === language && sessionConfigRef.current.mode === mode) return sessionIdRef.current;
    if (sessionIdRef.current) {
      socketRef.current?.close();
      sessionIdRef.current = null;
      sequenceRef.current = -1;
    }
    const ready = await client().ready();
    setIsVoiceAvailable(ready.ready);
    setStatusReason(ready.ready ? null : ((ready.reasonCode ?? ready.missingProviders.join(", ")) || "text_only"));
    if (!ready.ready) throw new Error(ready.reasonCode ?? "The MeriAI service is degraded.");
    const session = await client().createSession({ language, mode, client_capabilities: { audio: typeof MediaRecorder !== "undefined", subtitles: true, keyboard: true, browser_progress: true } });
    sessionIdRef.current = session.sessionId;
    sessionConfigRef.current = { language, mode };
    await connect();
    return session.sessionId;
  }, [client, connect, language, mode]);
  useEffect(() => {
    void client().ready().then((ready) => {
      setIsVoiceAvailable(ready.ready);
      setStatusReason(ready.ready ? null : ((ready.reasonCode ?? ready.missingProviders.join(", ")) || "text_only"));
    }).catch(() => {
      setIsVoiceAvailable(false);
      setStatusReason("service_unavailable");
    });
    void client().services().then(setServices).catch(() => setServices([]));
  }, [client]);
  const sendText = useCallback(async (text: string) => {
    const prompt = text.trim(); if (!prompt) return;
    setMessages((current) => [...current, createMessage("user", prompt)]); setIsProcessing(true); setError(null);
    try { const sessionId = await ensureSession(); const response = await client().sendText(sessionId, { text: prompt, language, turn_id: crypto.randomUUID() }); handlePayload(response); }
    catch (cause) { setIsProcessing(false); setError(cause instanceof Error ? cause : new Error("The service could not be reached.")); }
  }, [client, ensureSession, handlePayload, language]);
  const selectService = useCallback(async (serviceIdentifier: string) => {
    setIsProcessing(true); setError(null);
    try { const sessionId = await ensureSession(); const response = await client().sendText(sessionId, { service_identifier: serviceIdentifier, language, turn_id: crypto.randomUUID() }); handlePayload(response); }
    catch (cause) { setIsProcessing(false); setError(cause instanceof Error ? cause : new Error("The service could not be selected.")); }
  }, [client, ensureSession, handlePayload, language]);
  const answerQuestion = useCallback(async (questionKey: string, value: string) => {
    setIsProcessing(true); setError(null);
    try { const sessionId = await ensureSession(); const response = await client().sendText(sessionId, { answer: { question_key: questionKey, value }, language, turn_id: crypto.randomUUID() }); handlePayload(response); }
    catch (cause) { setIsProcessing(false); setError(cause instanceof Error ? cause : new Error("The answer could not be saved.")); }
  }, [client, ensureSession, handlePayload, language]);
  const stopVoice = useCallback(() => {
    const turnId = activeVoiceTurnRef.current;
    activeVoiceTurnRef.current = null;
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (turnId && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "audio.commit", turn_id: turnId }));
    }
    setIsProcessing(true);
  }, []);
  const startVoice = useCallback(async () => {
    if (!isVoiceAvailable || !navigator.mediaDevices) return;
    const mimeType = "audio/webm";
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported(mimeType)) {
      setIsVoiceAvailable(false);
      setStatusReason("audio_format_unsupported");
      return;
    }
    await ensureSession(); await connect();
    if (socketRef.current?.readyState !== WebSocket.OPEN) throw new Error("Voice connection is not ready.");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); streamRef.current = stream;
    const recorder = new MediaRecorder(stream, { mimeType }); recorderRef.current = recorder;
    const turnId = crypto.randomUUID();
    activeVoiceTurnRef.current = turnId;
    recordedBytesRef.current = 0;
    socketRef.current.send(JSON.stringify({ type: "audio.start", turn_id: turnId, language, mime_type: mimeType }));
    recorder.ondataavailable = async (event) => { recordedBytesRef.current += event.data.size; if (recordedBytesRef.current > 5 * 1024 * 1024) { stopVoice(); return; } if (event.data.size && socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(await event.data.arrayBuffer()); };
    recorder.start(250); setTranscript("");
  }, [connect, ensureSession, isVoiceAvailable, language, stopVoice]);
  const confirmAction = useCallback(async (confirmationText: string) => { const sessionId = sessionIdRef.current; if (!actionPreview || !sessionId || !confirmationText.trim()) return; try { const response = await client().confirm(sessionId, { tool_call_id: actionPreview.id, accepted: true, confirmation_text: confirmationText.trim() }); handlePayload(response); setActionPreview(null); } catch (cause) { setError(cause instanceof Error ? cause : new Error("Confirmation failed.")); } }, [actionPreview, client, handlePayload]);
  const startNewChat = useCallback(() => { socketRef.current?.close(); sessionIdRef.current = null; sessionConfigRef.current = null; sequenceRef.current = -1; setChecklist(null); setResearch(null); setActionPreview(null); setActivity([]); setMissingQuestions([]); setTranscript(""); setMessages([createMessage("ai", welcome)]); }, [welcome]);
  useEffect(() => () => { if (reconnectRef.current) clearTimeout(reconnectRef.current); recorderRef.current?.stop(); streamRef.current?.getTracks().forEach((track) => track.stop()); socketRef.current?.close(); }, []);
  return { messages, isProcessing, isVoiceAvailable, statusReason, transcript, checklist, research, actionPreview, activity, services, missingQuestions, error, sendText, selectService, answerQuestion, startVoice, stopVoice, confirmAction, startNewChat, isRecording: recorderRef.current?.state === "recording" };
}
