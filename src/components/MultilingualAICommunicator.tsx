import React, { useCallback, useEffect, useState } from "react";
import {
  AccessibilityPreferences,
  AppView,
  LanguageCode,
  UserProfile,
} from "../types";
import { LANGUAGES } from "../i18n/translations";
import { apiUrl } from "../services/apiConfig";
import {
  finishCurrentListeningNow,
  listenForUserSpeech,
} from "../services/voiceService";
import {
  BookOpenText,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";

interface MultilingualAICommunicatorProps {
  enabled: boolean;
  preferences: AccessibilityPreferences;
  user: UserProfile;
  currentView: AppView;
  pageSummary: string;
  onUpdateCaption: (caption: string) => void;
  onSpeakText: (text: string) => void;
  onHide: () => void;
}

const LABELS: Record<
  LanguageCode,
  {
    title: string;
    readingBadge: string;
    refreshBtn: string;
    transcribeBtn: string;
    doneSpeakingBtn: string;
    transcribing: string;
    placeholder: string;
    sendBtn: string;
    listenBtn: string;
    transcribedLabel: string;
    loadingText: string;
  }
> = {
  en: {
    title: "AI Chosen-Language Reader & Communicator",
    readingBadge: "Reading page & communicating in English",
    refreshBtn: "Re-read Page (AI)",
    transcribeBtn: "Transcribe Audio (Mic)",
    doneSpeakingBtn: "Done Speaking",
    transcribing: "Transcribing...",
    placeholder: "Reply or ask AI anything in English...",
    sendBtn: "Send",
    listenBtn: "Listen",
    transcribedLabel: "Transcribed audio",
    loadingText: "AI is reading the page in English...",
  },
  am: {
    title: "በአማርኛ የሚያነብ እና የሚያግባባ AI",
    readingBadge: "ጽሑፎችን በአማርኛ በማንበብ እና በመግባባት ላይ",
    refreshBtn: "ገጹን በአማርኛ አንብብ",
    transcribeBtn: "ድምፅ ወደ ጽሑፍ (Mic)",
    doneSpeakingBtn: "መናገር ጨርሻለሁ",
    transcribing: "በመገልበጥ ላይ...",
    placeholder: "በአማርኛ ወይም በድምፅ መልእክት ይጻፉ...",
    sendBtn: "ላክ",
    listenBtn: "አዳምጥ",
    transcribedLabel: "ከድምፅ የተገለበጠ",
    loadingText: "AI የገጹን ጽሑፎች በአማርኛ እያዘጋጀ ነው...",
  },
  om: {
    title: "Dubbistuu fi Quunnamtii AI Afaan Oromoo",
    readingBadge: "Barreeffama Afaan Oromootiin dubbisaa jira",
    refreshBtn: "Fuula Dubbisi (AI)",
    transcribeBtn: "Sagalee Barreeffamatti (Mic)",
    doneSpeakingBtn: "Dubbii Xumuri",
    transcribing: "Gara barreeffamaatti...",
    placeholder: "Afaan Oromootiin AI gaafadhu...",
    sendBtn: "Ergi",
    listenBtn: "Dhaggeeffadhu",
    transcribedLabel: "Sagalee barreeffame",
    loadingText: "AI fuula kana Afaan Oromootiin qindeessaa jira...",
  },
  so: {
    title: "Akhriyaha & Isgaarsiinta AI (Af-Soomaali)",
    readingBadge: "Wuxuu ku akhrinayaa kuna hadlayaa Af-Soomaali",
    refreshBtn: "Akhri Bogga (AI)",
    transcribeBtn: "Codka u Beddel Qoraal",
    doneSpeakingBtn: "Jooji Codka",
    transcribing: "Waa la qorayaa...",
    placeholder: "Ku weydii AI Af-Soomaali...",
    sendBtn: "Dir",
    listenBtn: "Dhegeyso",
    transcribedLabel: "Codka la qoray",
    loadingText: "AI wuxuu bogga ku diyaarinayaa Af-Soomaali...",
  },
  ti: {
    title: "ብትግርኛ ዘንብብን ዘዛርብን AI",
    readingBadge: "ጽሑፋት ብትግርኛ የንብብን የዘራርብን ኣሎ",
    refreshBtn: "ገጽ ብትግርኛ ኣንብብ",
    transcribeBtn: "ድምጺ ናብ ጽሑፍ (Mic)",
    doneSpeakingBtn: "ምዝራብ ወዲአ",
    transcribing: "ይቅየር ኣሎ...",
    placeholder: "ብትግርኛ ንAI ሕተት...",
    sendBtn: "ልኣኽ",
    listenBtn: "ስማዕ",
    transcribedLabel: "ዝተገልበጠ ዘረባ",
    loadingText: "AI ነዚ ገጽ ብትግርኛ የንብብ ኣሎ...",
  },
  ar: {
    title: "قارئ ومساعد AI باللغة العربية",
    readingBadge: "يقرأ الصفحة ويتواصل باللغة العربية",
    refreshBtn: "إعادة قراءة الصفحة (AI)",
    transcribeBtn: "تحويل الصوت لنص (ميكروفون)",
    doneSpeakingBtn: "أنهيت التحدث",
    transcribing: "جارٍ التحويل...",
    placeholder: "اسأل أو أجب الذكاء الاصطناعي بالعربية...",
    sendBtn: "إرسال",
    listenBtn: "استماع",
    transcribedLabel: "النص المنسوخ",
    loadingText: "يقوم AI بقراءة الصفحة بالعربية...",
  },
  fr: {
    title: "Lecteur & Communicateur IA en Français",
    readingBadge: "Lit la page et communique en français",
    refreshBtn: "Relire la page (IA)",
    transcribeBtn: "Transcrire l'audio (Micro)",
    doneSpeakingBtn: "J'ai fini",
    transcribing: "Transcription...",
    placeholder: "Posez une question à l'IA en français...",
    sendBtn: "Envoyer",
    listenBtn: "Écouter",
    transcribedLabel: "Audio transcrit",
    loadingText: "L'IA lit la page en français...",
  },
  sw: {
    title: "Msomaji na Msaidizi wa AI kwa Kiswahili",
    readingBadge: "Inasoma ukurasa na kuwasiliana kwa Kiswahili",
    refreshBtn: "Soma Ukurasa Tena (AI)",
    transcribeBtn: "Nakili Sauti (Mikrofoni)",
    doneSpeakingBtn: "Nimemaliza",
    transcribing: "Inanakili...",
    placeholder: "Uliza au jibu AI kwa Kiswahili...",
    sendBtn: "Tuma",
    listenBtn: "Sikiliza",
    transcribedLabel: "Sauti iliyonakiliwa",
    loadingText: "AI inasoma ukurasa kwa Kiswahili...",
  },
};

export const MultilingualAICommunicator: React.FC<
  MultilingualAICommunicatorProps
> = ({
  enabled,
  preferences,
  user,
  currentView,
  pageSummary,
  onUpdateCaption,
  onSpeakText,
  onHide,
}) => {
  const [aiMessage, setAiMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [micState, setMicState] = useState<
    "idle" | "listening" | "transcribing"
  >("idle");
  const [lastTranscribed, setLastTranscribed] = useState("");
  const [micError, setMicError] = useState("");

  const isDeaf = preferences.disabilities.includes("deaf");
  const isBlind = preferences.disabilities.includes("blind");
  const labels = LABELS[preferences.language];
  const langMeta = LANGUAGES.find((l) => l.code === preferences.language);

  const communicateWithAI = useCallback(
    async (messageToSend = "") => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl("/api/ai-communicate"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: preferences.language,
            view: currentView,
            isDeaf,
            isBlind,
            userName: user.name || "Learner",
            careerPlan: user.careerPlan,
            pageSummary,
            userMessage: messageToSend,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { reply?: string };
          const reply = (data.reply || "").trim();
          if (reply) {
            setAiMessage(reply);
            onUpdateCaption(reply);
          }
        }
      } catch {
        // Keep previous message cleanly
      } finally {
        setLoading(false);
      }
    },
    [
      currentView,
      isBlind,
      isDeaf,
      onUpdateCaption,
      pageSummary,
      preferences.language,
      user.careerPlan,
      user.name,
    ]
  );

  // Automatically read page texts & communicate in the user's chosen language when view or language changes
  useEffect(() => {
    if (!enabled) return;
    communicateWithAI("");
  }, [enabled, currentView, preferences.language, communicateWithAI]);

  if (!enabled) {
    return null;
  }

  const handleTranscribeAndSend = async () => {
    setMicError("");
    if (micState === "listening") {
      finishCurrentListeningNow();
      return;
    }
    const res = await listenForUserSpeech({
      language: preferences.language,
      maxDurationMs: 8500,
      translateToChosenLanguage: true,
      onStateChange: setMicState,
    });
    if (res.micError) {
      setMicError(res.micError);
      return;
    }
    const text = (res.localizedTranscript || res.transcript || "").trim();
    if (text) {
      setLastTranscribed(text);
      setUserInput(text);
      await communicateWithAI(text);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = userInput.trim();
    if (!msg || loading) return;
    setUserInput("");
    await communicateWithAI(msg);
  };

  return (
    <section
      aria-label={labels.title}
      className="border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <BookOpenText
              className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF] shrink-0"
              aria-hidden="true"
            />
            <span className="font-semibold text-[#1F2328] dark:text-[#E6EDF3]">
              {labels.title}
            </span>
            <span className="text-[#0969DA] dark:text-[#58A6FF] font-medium">
              · {langMeta?.nativeName} · {labels.readingBadge}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => communicateWithAI("")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-[#0969DA]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{labels.refreshBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleTranscribeAndSend}
              disabled={micState === "transcribing"}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md ${
                micState === "listening"
                  ? "bg-[#1A7F37] text-white"
                  : "bg-[#0969DA] text-white hover:bg-[#0550AE]"
              }`}
            >
              {micState === "listening" ? (
                <>
                  <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{labels.doneSpeakingBtn}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {micState === "transcribing"
                      ? labels.transcribing
                      : labels.transcribeBtn}
                  </span>
                </>
              )}
            </button>

            {aiMessage && (
              <button
                type="button"
                onClick={() => onSpeakText(aiMessage)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{labels.listenBtn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onHide}
              className="px-2 py-1 text-[11px] text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328]"
            >
              Hide
            </button>
          </div>
        </div>

        {/* Chosen-Language AI Output Card */}
        <div
          aria-live="polite"
          className="rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] px-3.5 py-2.5 space-y-1.5"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0969DA] dark:text-[#58A6FF]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{langMeta?.nativeName} AI</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#1F2328] dark:text-[#E6EDF3] whitespace-pre-wrap">
            {loading && !aiMessage ? labels.loadingText : aiMessage}
          </p>
          {lastTranscribed && (
            <p className="text-[11px] text-[#1A7F37] dark:text-[#3FB950] font-medium">
              {labels.transcribedLabel}: &ldquo;{lastTranscribed}&rdquo;
            </p>
          )}
          {micError && (
            <p role="alert" className="text-[11px] text-[#CF222E] dark:text-[#F85149]">
              {micError}
            </p>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <label htmlFor="ai-comm-input" className="sr-only">
            {labels.placeholder}
          </label>
          <input
            id="ai-comm-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={labels.placeholder}
            className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] text-white hover:bg-[#0550AE] disabled:opacity-60"
          >
            <Send className="w-3 h-3" aria-hidden="true" />
            <span>{labels.sendBtn}</span>
          </button>
        </form>
      </div>
    </section>
  );
};
