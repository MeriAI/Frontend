import type { Language } from "@/types/studio";

const en = {
  marketing: {
    badge: "Ethiopian government services, made clearer",
    titleLead: "Know what you need",
    titleTail: "before you visit a government office.",
    lede: "Skip the uncertainty. Get requirements, document checklists, fees, and next steps for Ethiopian government services in straightforward language—before you begin.",
    highlights: [
      "Requirement guidance",
      "Document checklists",
      "Voice and chat support",
    ],
    catalogueLink: "Browse the service catalogue",
    assistant: {
      heading: "Chat with our AI assistant",
      subtitle: "Voice or chat · Amharic and English",
      status: "Online",
      previewAssistant:
        "Tell me which government service you need. I’ll explain the requirements, documents, fees, and the order of each step.",
      previewUser: "What should I prepare before I go to the office?",
      tryAsking: "Try asking",
      questions: [
        "What documents do I need?",
        "How much are the fees?",
        "How long does it take?",
        "Where do I apply?",
      ],
      chatEntry: "Ask about any government service…",
      chatEntryLabel: "Open the AI assistant chat",
      voiceEntry: "Prefer talking? Start a voice session",
      disclaimer:
        "Guidance references official agency information and never replaces an official application.",
    },
    controls: {
      accessibility: "Accessibility settings",
    },
  },
  services: {
    back: "Back to home",
    eyebrow: "Government services",
    title: "Which government service do you need?",
    lede: "Choose a service to understand the process, prepare your documents, and start with confidence.",
    searchHint:
      "Browse identity, civil registration, licensing, and revenue services",
  },
  catalogue: {
    heading: "Service catalogue",
    summary: (available: number, pending: number) =>
      `${available} service available now · ${pending} services in preparation`,
    reviewNote: "Last reviewed against agency guidance",
    availableBadge: "Available Now",
    pendingBadge: "Coming Soon",
    sourceLabel: "Source",
    availableFooter: "Covered by the assistant",
    pendingFooter: "Guidance in preparation",
    noticeTitle: "Important service notice",
    noticeBody:
      "This desk provides preparation guidance only. Applications, appointments, payments, and final decisions remain with the responsible Ethiopian authorities.",
    entries: {
      passport: {
        title: "Passport Application & Renewal",
        description:
          "Prepare for a new passport application or renewal with requirement guidance and a personalized document checklist.",
        source: "Immigration and Citizenship Service (ICS)",
      },
      nationalId: {
        title: "National ID Registration",
        description:
          "Understand enrolment requirements, accepted proof of identity, and how to update your national ID details.",
        source: "National ID Program",
      },
      civil: {
        title: "Birth & Civil Registration",
        description:
          "Learn what is needed to register a birth, marriage, or death and to request certified civil records.",
        source: "Vital Events Registration Agency",
      },
      driving: {
        title: "Driving Licence Services",
        description:
          "Find out about eligibility, testing steps, and renewal or replacement requirements for a driving licence.",
        source: "Transport Authority",
      },
      business: {
        title: "Business & Trade Licensing",
        description:
          "Prepare for business name registration, trade licence issuance, and annual renewal obligations.",
        source: "Ministry of Trade and Regional Integration",
      },
      tax: {
        title: "Tax Registration & Filing",
        description:
          "Understand taxpayer registration, filing schedules, and the documents required for each declaration.",
        source: "Ministry of Revenues",
      },
      land: {
        title: "Land & Property Records",
        description:
          "Review the steps and paperwork for title deeds, property transfers, and land-use certificate requests.",
        source: "Urban Land Administration",
      },
      education: {
        title: "Education Document Authentication",
        description:
          "See how transcripts, diplomas, and foreign credentials are verified and authenticated for official use.",
        source: "Ministry of Education",
      },
    },
  },
  studio: {
    voiceMode: "Voice",
    chatMode: "Chat",
    accessibilityTitle: "Accessibility Settings",
    mute: "Mute Speech Output",
    unmute: "Unmute Speech Output",
  },
  voice: {
    initialResponse: "Tap the sphere or button to begin speaking.",
    idle: "Tap sphere to speak",
    listening: "Listening...",
    processing: "Processing audio...",
    speaking: "Speaking...",
    prompt: "Say something...",
    processingDetail: "Processing voice frequency...",
    start: "Start Voice Session",
    stop: "Done Speaking",
    startLabel: "Tap to speak",
    stopLabel: "Stop listening",
  },
  chat: {
    contextTitle: "MeriAI",
    contextSubtitle: "Requirements, documents, fees, and next steps",
    officialBadge: "Official-source guidance",
    emptyTitle: "Which government service can I help you prepare for?",
    emptyBody:
      "Ask a question or choose a verified service from the service panel. Guidance is informational and does not replace an official application.",
    newInquiry: "New inquiry",
    topicsLabel: "Available services",
    servicesLoading: "Loading verified services…",
    placeholder:
      "Ask about any government service: documents, fees, offices, or timelines...",
    speakTitle: "Speak prompt",
    assistantName: "MeriAI",
    assistantFooter: "Service guidance",
    userFooter: "You",
    copyTitle: "Copy text",
    speakAloudTitle: "Speak response aloud",
    sources: "Sources",
    sourceCount: (count: number) => `${count} ${count === 1 ? "source" : "sources"}`,
    researchReviewNotice: "External research only. Review these sources before relying on this guidance.",
    welcome:
      "Welcome to MeriAI. I can help you understand requirements, documents, fees, and next steps for Ethiopian government services. Which service would you like to prepare for?",
    newSession:
      "New session started. Which government service or requirement can I help you understand?",
    emptyResponse:
      "I received your request, but no guidance came back. Please try again.",
    errorFallback:
      "I could not reach the service just now. Please try again in a moment.",
  },
  accessibility: {
    title: "Accessibility",
    subtitle: "Personalize how the studio looks and reads",
    close: "Close accessibility settings",
    language: "Language",
    languageHint: "Choose the interface language",
    textSize: "Text size",
    textSizeHint: "Select a comfortable reading size",
    preview: "Preview",
    previewText: "Your studio text will look like this.",
    appearance: "Appearance",
    appearanceHint: "Switch between light and dark themes",
    light: "Light",
    dark: "Dark",
    contrast: "Contrast",
    contrastHint: "Increase separation between interface colors",
    contrastNormal: "Normal",
    contrastHigh: "High",
    contrastMax: "Maximum",
    reset: "Reset defaults",
    done: "Done",
  },
};

export type Translation = typeof en;

const am: Translation = {
  marketing: {
    badge: "የኢትዮጵያ የመንግስት አገልግሎቶች፣ ይበልጥ ግልጽ ሆነው",
    titleLead: "የሚያስፈልግዎትን ይወቁ",
    titleTail: "ወደ መንግስት ቢሮ ከመሄድዎ በፊት።",
    lede: "ጥርጣሬን ያስወግዱ። ከመጀመርዎ በፊት ለኢትዮጵያ የመንግስት አገልግሎቶች የሚያስፈልጉ መስፈርቶችን፣ የሰነድ ዝርዝሮችን፣ ክፍያዎችን እና ቀጣይ ደረጃዎችን በቀላል ቋንቋ ይረዱ።",
    highlights: ["የመስፈርት መመሪያ", "የሰነድ ዝርዝር", "የድምፅ እና ቻት ድጋፍ"],
    catalogueLink: "የአገልግሎት ዝርዝሩን ይመልከቱ",
    assistant: {
      heading: "ከAI ረዳታችን ጋር ይወያዩ",
      subtitle: "ድምፅ ወይም ቻት · አማርኛ እና እንግሊዝኛ",
      status: "በመስመር ላይ",
      previewAssistant:
        "የሚፈልጉትን የመንግስት አገልግሎት ይንገሩኝ። መስፈርቶቹን፣ ሰነዶቹን፣ ክፍያዎቹን እና የደረጃዎቹን ቅደም ተከተል አብራራልዎታለሁ።",
      previewUser: "ወደ ቢሮ ከመሄዴ በፊት ምን ማዘጋጀት አለብኝ?",
      tryAsking: "እነዚህን ይጠይቁ",
      questions: [
        "ምን ሰነዶች ያስፈልጉኛል?",
        "ክፍያው ስንት ነው?",
        "ምን ያህል ጊዜ ይወስዳል?",
        "የት ማመልከት እችላለሁ?",
      ],
      chatEntry: "ስለ ማንኛውም የመንግስት አገልግሎት ይጠይቁ…",
      chatEntryLabel: "የAI ረዳት ቻትን ክፈት",
      voiceEntry: "ማውራት ይመርጣሉ? የድምፅ ክፍለ ጊዜ ይጀምሩ",
      disclaimer:
        "መመሪያው ከመንግስት አካላት ይፋዊ መረጃ የተወሰደ ነው፤ ይፋዊ ማመልከቻን አይተካም።",
    },
    controls: {
      accessibility: "የተደራሽነት መቼቶች",
    },
  },
  services: {
    back: "ወደ መጀመሪያ ገጽ ተመለስ",
    eyebrow: "የመንግስት አገልግሎቶች",
    title: "የትኛው የመንግስት አገልግሎት ያስፈልግዎታል?",
    lede: "ሂደቱን ለመረዳት፣ ሰነዶችዎን ለማዘጋጀት እና በእርግጠኝነት ለመጀመር አገልግሎት ይምረጡ።",
    searchHint: "የማንነት፣ የሲቪል ምዝገባ፣ የፈቃድ እና የገቢ አገልግሎቶችን ይመልከቱ",
  },
  catalogue: {
    heading: "የአገልግሎት ዝርዝር",
    summary: (available: number, pending: number) =>
      `${available} አገልግሎት አሁን ይገኛል · ${pending} አገልግሎቶች በዝግጅት ላይ`,
    reviewNote: "ከመንግስት አካላት መመሪያ ጋር በመጨረሻ ተመሳክሯል",
    availableBadge: "አሁን ይገኛል",
    pendingBadge: "በቅርቡ ይመጣል",
    sourceLabel: "ምንጭ",
    availableFooter: "በAI ረዳቱ ውስጥ ይገኛል",
    pendingFooter: "መመሪያ በዝግጅት ላይ",
    noticeTitle: "አስፈላጊ የአገልግሎት ማስታወቂያ",
    noticeBody:
      "ይህ አገልግሎት የመዘጋጃ መመሪያ ብቻ ይሰጣል። ማመልከቻዎች፣ ቀጠሮዎች፣ ክፍያዎች እና የመጨረሻ ውሳኔዎች በተመለከታቸው የኢትዮጵያ አካላት ይከናወናሉ።",
    entries: {
      passport: {
        title: "የፓስፖርት ማመልከቻ እና እድሳት",
        description:
          "ለአዲስ ፓስፖርት ማመልከቻ ወይም እድሳት የሚያስፈልጉ መስፈርቶችን እና የግል የሰነድ ዝርዝርን ይረዱ።",
        source: "የኢሚግሬሽንና ዜግነት አገልግሎት (ICS)",
      },
      nationalId: {
        title: "የብሔራዊ መታወቂያ ምዝገባ",
        description:
          "የምዝገባ መስፈርቶችን፣ ተቀባይነት ያላቸውን የማንነት ማረጋገጫዎችን እና መረጃዎን የማዘመን ሂደትን ይረዱ።",
        source: "የብሔራዊ መታወቂያ ፕሮግራም",
      },
      civil: {
        title: "የልደት እና የሲቪል ምዝገባ",
        description:
          "ልደት፣ ጋብቻ ወይም ሞት ለመመዝገብ እና የተረጋገጠ የምዝገባ ሰነድ ለመጠየቅ የሚያስፈልገውን ይወቁ።",
        source: "የወሳኝ ኩነቶች ምዝገባ ኤጀንሲ",
      },
      driving: {
        title: "የመንጃ ፈቃድ አገልግሎቶች",
        description:
          "የመንጃ ፈቃድ ብቁነትን፣ የፈተና ደረጃዎችን እና የእድሳት ወይም የመተካት መስፈርቶችን ይረዱ።",
        source: "የትራንስፖርት ባለስልጣን",
      },
      business: {
        title: "የንግድ ስራ ፈቃድ ምዝገባ",
        description:
          "የንግድ ስም ምዝገባን፣ የንግድ ፈቃድ አሰጣጥን እና የዓመታዊ እድሳት ግዴታዎችን ይረዱ።",
        source: "የንግድና ቀጣናዊ ትስስር ሚኒስቴር",
      },
      tax: {
        title: "የታክስ ምዝገባ እና ማስታወቅ",
        description:
          "የታክስ ከፋይ ምዝገባን፣ የማስታወቂያ ጊዜያትን እና ለእያንዳንዱ ማስታወቂያ የሚያስፈልጉ ሰነዶችን ይረዱ።",
        source: "የገቢዎች ሚኒስቴር",
      },
      land: {
        title: "የመሬትና የይዞታ መዝገቦች",
        description:
          "የይዞታ ማረጋገጫ፣ የንብረት ዝውውር እና የመሬት ይዞታ ማረጋገጫ ጥያቄዎችን ሂደትና ሰነዶች ይመልከቱ።",
        source: "የከተማ መሬት አስተዳደር",
      },
      education: {
        title: "የትምህርት ሰነድ ማረጋገጥ",
        description:
          "የትምህርት ማስረጃዎች፣ ዲፕሎማዎች እና የውጭ ሰነዶች ለይፋዊ አገልግሎት እንዴት እንደሚረጋገጡ ይረዱ።",
        source: "የትምህርት ሚኒስቴር",
      },
    },
  },
  studio: {
    voiceMode: "ድምፅ",
    chatMode: "ቻት",
    accessibilityTitle: "የተደራሽነት መቼቶች",
    mute: "ድምፅ አቁም",
    unmute: "ድምፅ አስጀምር",
  },
  voice: {
    initialResponse: "ለመጀመር ሉሉን ወይም አዝራሩን ይንኩ።",
    idle: "ለመናገር ይንኩ",
    listening: "በማዳመጥ ላይ...",
    processing: "ድምፅን በማስኬድ ላይ...",
    speaking: "በመናገር ላይ...",
    prompt: "አንድ ነገር ይናገሩ...",
    processingDetail: "የድምፅ ሞገድን በማስኬድ ላይ...",
    start: "የድምፅ ክፍለ ጊዜ ጀምር",
    stop: "ንግግር ጨርሻለሁ",
    startLabel: "ለመናገር ይንኩ",
    stopLabel: "ማዳመጥ አቁም",
  },
  chat: {
    contextTitle: "MeriAI",
    contextSubtitle: "መስፈርቶች፣ ሰነዶች፣ ክፍያዎች እና ቀጣይ ደረጃዎች",
    officialBadge: "ከይፋዊ ምንጭ የተወሰደ መመሪያ",
    emptyTitle: "የትኛውን የመንግስት አገልግሎት እንዲያዘጋጁ ልረዳዎት?",
    emptyBody:
      "ጥያቄ ይጠይቁ ወይም ከአገልግሎት ፓነሉ የተረጋገጠ አገልግሎት ይምረጡ። መመሪያው መረጃ ሰጪ ብቻ ነው፤ ይፋዊ ማመልከቻን አይተካም።",
    newInquiry: "አዲስ ጥያቄ",
    topicsLabel: "የሚገኙ አገልግሎቶች",
    servicesLoading: "የተረጋገጡ አገልግሎቶችን በመጫን ላይ…",
    placeholder:
      "ስለ ማንኛውም የመንግስት አገልግሎት ይጠይቁ፦ ሰነዶች፣ ክፍያዎች፣ ቢሮዎች ወይም ጊዜያት...",
    speakTitle: "ጥያቄውን በድምፅ ተናገር",
    assistantName: "MeriAI",
    assistantFooter: "የአገልግሎት መመሪያ",
    userFooter: "እርስዎ",
    copyTitle: "ጽሑፉን ቅዳ",
    speakAloudTitle: "መልሱን በድምፅ አንብብ",
    sources: "ምንጮች",
    sourceCount: (count: number) => `${count} ምንጭ${count === 1 ? "" : "ች"}`,
    researchReviewNotice: "ይህ ከውጭ ምርምር የተገኘ መረጃ ነው። በመመሪያው ላይ ከመተማመንዎ በፊት ምንጮቹን ይመልከቱ።",
    welcome:
      "ወደ MeriAI እንኳን በደህና መጡ። ለኢትዮጵያ የመንግስት አገልግሎቶች መስፈርቶችን፣ ሰነዶችን፣ ክፍያዎችን እና ቀጣይ ደረጃዎችን ለመረዳት ልረዳዎት እችላለሁ። የትኛውን አገልግሎት እንዲያዘጋጁ ይፈልጋሉ?",
    newSession:
      "አዲስ ክፍለ ጊዜ ተጀምሯል። የትኛውን የመንግስት አገልግሎት ወይም መስፈርት እንዲረዱ ልረዳዎት?",
    emptyResponse: "ጥያቄዎን ተቀብያለሁ፤ ግን ምላሽ አልተገኘም። እባክዎ እንደገና ይሞክሩ።",
    errorFallback: "አገልግሎቱን አሁን ማግኘት አልቻልኩም። እባክዎ ከጥቂት ጊዜ በኋላ ይሞክሩ።",
  },
  accessibility: {
    title: "የተደራሽነት መቼቶች",
    subtitle: "ማሳያውን እና ቋንቋውን ያስተካክሉ",
    close: "የተደራሽነት መቼቶችን ዝጋ",
    language: "ቋንቋ",
    languageHint: "የመተግበሪያውን ቋንቋ ይምረጡ",
    textSize: "የፊደል መጠን",
    textSizeHint: "ለማንበብ የሚመች መጠን ይምረጡ",
    preview: "ቅድመ እይታ",
    previewText: "ይህ ጽሑፍ እንደዚህ ይታያል።",
    appearance: "ገጽታ",
    appearanceHint: "ብርሃን ወይም ጨለማ ገጽታ ይምረጡ",
    light: "ብርሃን",
    dark: "ጨለማ",
    contrast: "ንፅፅር",
    contrastHint: "የቀለም ልዩነቱን ያስተካክሉ",
    contrastNormal: "መደበኛ",
    contrastHigh: "ከፍተኛ",
    contrastMax: "እጅግ ከፍተኛ",
    reset: "ነባሪውን መልስ",
    done: "ተጠናቋል",
  },
};

export const translations: Record<Language, Translation> = { en, am };
