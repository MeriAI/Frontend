import { StudioApp } from "@/components/studio/studio-app";

interface StudioPageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const { mode } = await searchParams;

  return <StudioApp initialMode={mode === "chat" ? "chat" : "voice"} />;
}
