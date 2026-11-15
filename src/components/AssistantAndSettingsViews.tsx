import React, { useState } from "react";
import {
  AccessibilityPreferences,
  ColorConfusionOption,
  Course,
  DisabilityType,
  JobOpportunity,
  LanguageCode,
  UserProfile,
} from "../types";
import { LANGUAGES, TRANSLATIONS } from "../i18n/translations";
import { apiUrl } from "../services/apiConfig";
import {
  finishCurrentListeningNow,
  listenForUserSpeech,
  stopActiveListening,
} from "../services/voiceService";
import { Send, Volume2, RotateCcw, Mic, MicOff } from "lucide-react";

interface AssistantViewProps {
  preferences: AccessibilityPreferences;
  user: UserProfile;
  courses: Course[];
  jobs: JobOpportunity[];
  onSpeakText: (text: string) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const ASSISTANT_GREETINGS: Record<
  LanguageCode,
  (role: string, track: string) => string
> = {
  en: (role, track) =>
    `Ready to support your Career Plan (${role} · ${track}). Ask me by text or microphone audio to analyze skill gaps, recommend Savannah courses, or build a weekly study plan.`,
  am: (role, track) =>
    `የሥራ ዕቅድዎን (${role} · ${track}) ለመደገፍ ዝግጁ ነኝ። በጽሑፍ ወይም በማይክሮፎን ድምፅ ስለ ክህሎት ክፍተቶች፣ ስለ ሳቫና ኮርሶች እና ስለ ሳምንታዊ የጥናት ዕቅድ በአማርኛ ይጠይቁኝ።`,
  om: (role, track) =>
    `Karoora hojii keessan (${role} · ${track}) deeggaruuf qophiidha. Barreeffamaan ykn sagaleedhaan koorsiiwwan Savannah fi ogummaawwan isin barbaachisan Afaan Oromootiin na gaafadhaa.`,
  so: (role, track) =>
    `Waxaan diyaar u ahay inaan taageero Qorshahaaga Shaqo (${role} · ${track}). Igu weydii qoraal ama cod Af-Soomaali ah koorsooyinka Savannah iyo xirfadaha aad u baahan tahay.`,
  ti: (role, track) =>
    `መደብ ስራሕካ (${role} · ${track}) ንምድጋፍ ድሉው እየ። ብጽሑፍ ወይ ብድምጺ ብዛዕባ ክእለታትን ኮርሳት ሳቫናን ብትግርኛ ሕተተኒ።`,
  ar: (role, track) =>
    `أنا جاهز لدعم خطتك المهنية (${role} · ${track}). اسألني كتابةً أو عبر الميكروفون باللغة العربية لتحليل المهارات أو التوصية بالدورات.`,
  fr: (role, track) =>
    `Prêt à soutenir votre plan de carrière (${role} · ${track}). Posez vos questions par texte ou au microphone en français.`,
  sw: (role, track) =>
    `Niko tayari kusaidia Mpango wako wa Kazi (${role} · ${track}). Niulize kwa maandishi au sauti kwa Kiswahili.`,
};

export const AssistantView: React.FC<AssistantViewProps> = ({
  preferences,
  user,
  courses,
  jobs,
  onSpeakText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: ASSISTANT_GREETINGS[preferences.language](
        user.careerPlan.targetRole,
        user.careerPlan.targetTrack
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [micState, setMicState] = useState<"idle" | "listening" | "transcribing">("idle");
  const [micNote, setMicNote] = useState("");

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: textToSend.trim() },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/assistant"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          language: preferences.language,
          disabilityProfiles: preferences.disabilities,
          careerPlan: user.careerPlan,
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            field: c.field,
            skills: c.skills,
          })),
          jobs: jobs.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            track: j.track,
          })),
          history: nextMessages,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        const reply = data.reply || "No response received.";
        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
        if (preferences.disabilities.includes("blind")) {
          onSpeakText(reply);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Unable to reach AI service right now. Please try again.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceAsk = async () => {
    setMicNote("");
    if (micState === "listening") {
      finishCurrentListeningNow();
      return;
    }
    const res = await listenForUserSpeech({
      language: preferences.language,
      maxDurationMs: 8000,
      translateToChosenLanguage: true,
      onStateChange: setMicState,
    });
    if (res.micError) {
      setMicNote(res.micError);
      return;
    }
    const chosenText = (res.localizedTranscript || res.transcript || "").trim();
    if (chosenText) {
      setInput(chosenText);
      await sendMessage(chosenText);
    } else {
      stopActiveListening();
    }
  };

  const quickPrompts = [
    "Identify my top skill gaps for my Career Plan",
    "Create a 4-week Savannah study plan",
    "Which remote jobs fit my profile best?",
    "How can I customize accessibility tools here?",
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          AI Career Assistant
        </h1>
        <p className="text-sm text-[#656D76] dark:text-[#8B949E] mt-1">
          Responds in{" "}
          {LANGUAGES.find((l) => l.code === preferences.language)?.nativeName}{" "}
          based on your Career Plan and accessibility profile.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            type="button"
            onClick={() => sendMessage(qp)}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-[#0969DA]"
          >
            {qp}
          </button>
        ))}
      </div>

      <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-md border text-sm leading-relaxed ${
                m.role === "user"
                  ? "border-[#0969DA]/30 bg-[#0969DA]/5 ml-8"
                  : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] mr-8"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold text-[#656D76] dark:text-[#8B949E]">
                  {m.role === "user" ? user.name : "AccessPath AI Assistant"}
                </span>
                {m.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => onSpeakText(m.text)}
                    aria-label="Listen to assistant response"
                    className="inline-flex items-center gap-1 text-[11px] text-[#0969DA] dark:text-[#58A6FF]"
                  >
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
              Thinking in {LANGUAGES.find((l) => l.code === preferences.language)?.nativeName}...
            </div>
          )}
        </div>

        {micNote && (
          <p role="alert" className="text-xs text-[#CF222E] dark:text-[#F85149]">
            {micNote}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]"
        >
          <label htmlFor="assistant-chat-input" className="sr-only">
            Ask the AI Career Assistant
          </label>
          <input
            id="assistant-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask by typing or speaking about career goals, courses, or skill gaps..."
            className="flex-1 px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          />
          <button
            type="button"
            onClick={handleVoiceAsk}
            disabled={loading || micState === "transcribing"}
            aria-label={micState === "listening" ? "Done speaking" : "Ask by voice"}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-md border ${
              micState === "listening"
                ? "border-[#1A7F37] bg-[#1A7F37] text-white"
                : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            }`}
          >
            {micState === "listening" ? (
              <>
                <MicOff className="w-4 h-4" aria-hidden="true" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" aria-hidden="true" />
                <span>{micState === "transcribing" ? "..." : "Voice"}</span>
              </>
            )}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] disabled:opacity-60"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

interface SettingsViewProps {
  preferences: AccessibilityPreferences;
  onSelectLanguage: (lang: LanguageCode) => void;
  onToggleDisability: (d: DisabilityType) => void;
  onToggleColorConfusion: (opt: ColorConfusionOption) => void;
  onUpdatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    val: AccessibilityPreferences[K]
  ) => void;
  onSpeakText: (text: string) => void;
  onResetPreferences: () => void;
  onReturnToOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onSelectLanguage,
  onToggleDisability,
  onToggleColorConfusion,
  onUpdatePreference,
  onSpeakText,
  onResetPreferences,
  onReturnToOnboarding,
}) => {
  const t = TRANSLATIONS[preferences.language];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Accessibility &amp; Language Settings
          </h1>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E] mt-1">
            Preferences are saved automatically without losing your learning progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReturnToOnboarding}
            className="px-3.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
          >
            Re-run Onboarding
          </button>
          <button
            type="button"
            onClick={onResetPreferences}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
        <h2 className="text-base font-semibold">Platform &amp; Voice Language</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {LANGUAGES.map((lang) => {
            const active = preferences.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`p-3 rounded-md border text-left text-xs ${
                  active
                    ? "border-[#0969DA] bg-[#0969DA]/10 font-semibold"
                    : "border-[#D0D7DE] dark:border-[#30363D]"
                }`}
              >
                <div className="text-sm font-bold">{lang.nativeName}</div>
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  {lang.ttsLabel}
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeakText(
              t.disabilities[preferences.disabilities[0] || "standard"]
                .instantVoiceInstruction
            )
          }
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0969DA] text-white"
        >
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Test Ethiopian / Selected Voice Instructor</span>
        </button>
      </section>

      {/* Disability Profiles */}
      <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
        <h2 className="text-base font-semibold">Accessibility Profiles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(["blind", "deaf", "motor", "color", "standard"] as DisabilityType[]).map(
            (d) => {
              const selected = preferences.disabilities.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onToggleDisability(d)}
                  aria-pressed={selected}
                  className={`p-3 rounded-md border text-left text-xs ${
                    selected
                      ? "border-[#0969DA] bg-[#0969DA]/10"
                      : "border-[#D0D7DE] dark:border-[#30363D]"
                  }`}
                >
                  <div className="font-semibold">{t.disabilities[d].title}</div>
                  <div className="text-[#656D76] dark:text-[#8B949E] mt-0.5">
                    {t.disabilities[d].summary}
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Display, Contrast, Color Vision & Motion */}
      <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
        <h2 className="text-base font-semibold">Visual, Motion &amp; Caption Controls</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label htmlFor="text-scale-range" className="block text-xs font-medium mb-1">
              Text Size ({Math.round(preferences.textScale * 100)}%)
            </label>
            <input
              id="text-scale-range"
              type="range"
              min={0.9}
              max={1.35}
              step={0.05}
              value={preferences.textScale}
              onChange={(e) =>
                onUpdatePreference("textScale", Number(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) =>
                  onUpdatePreference("highContrast", e.target.checked)
                }
              />
              <span>High Contrast Borders &amp; Text</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) =>
                  onUpdatePreference("reducedMotion", e.target.checked)
                }
              />
              <span>Reduced Motion (disable transitions &amp; animations)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.captionsEnabled}
                onChange={(e) =>
                  onUpdatePreference("captionsEnabled", e.target.checked)
                }
              />
              <span>Always Show Synchronized Instructor Captions</span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] space-y-2">
          <div className="text-xs font-semibold">
            Color-Vision Difficulty Combinations
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["red_green", "Red & Green"],
                ["green_brown", "Green & Brown"],
                ["blue_yellow", "Blue & Yellow"],
                ["blue_purple", "Blue & Purple"],
                ["most_colors", "Most Colors"],
              ] as Array<[ColorConfusionOption, string]>
            ).map(([id, label]) => {
              const active = preferences.colorConfusions.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleColorConfusion(id)}
                  className={`px-3 py-1.5 text-xs rounded-md border ${
                    active
                      ? "border-[#0969DA] bg-[#0969DA]/10 font-semibold"
                      : "border-[#D0D7DE] dark:border-[#30363D]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] text-xs text-[#656D76] dark:text-[#8B949E]">
          <span className="font-semibold text-[#1F2328] dark:text-[#E6EDF3]">
            Keyboard Navigation Guide:
          </span>{" "}
          Use <kbd className="px-1.5 py-0.5 border rounded">Tab</kbd> /{" "}
          <kbd className="px-1.5 py-0.5 border rounded">Shift+Tab</kbd> to move between controls,{" "}
          <kbd className="px-1.5 py-0.5 border rounded">Enter</kbd> to activate, and{" "}
          <kbd className="px-1.5 py-0.5 border rounded">Alt+R</kbd> to hear the current page summary.
        </div>
      </section>
    </div>
  );
};
