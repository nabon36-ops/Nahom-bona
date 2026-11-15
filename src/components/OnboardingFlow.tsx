import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityPreferences,
  CareerPlan,
  ColorConfusionOption,
  DisabilityType,
  LanguageCode,
  UserProfile,
} from "../types";
import { LANGUAGES, TRANSLATIONS } from "../i18n/translations";
import { OnboardingQuestionId, VOICE_SCRIPTS } from "../i18n/voiceScripts";
import {
  finishCurrentListeningNow,
  interpretOnboardingVoiceAnswer,
  interpretStep2VoiceCommand,
  listenForUserSpeech,
  stopActiveListening,
  VoicePlaybackResult,
} from "../services/voiceService";
import { CAREER_TRACKS, TARGET_SKILLS_POOL } from "../data/catalog";
import {
  Volume2,
  Square,
  Check,
  ArrowRight,
  ArrowLeft,
  Eye,
  Ear,
  Hand,
  Palette,
  Compass,
  Sun,
  Moon,
  Mic,
  MicOff,
  RotateCw,
  SkipForward,
} from "lucide-react";

interface OnboardingFlowProps {
  preferences: AccessibilityPreferences;
  user: UserProfile;
  voiceStatus: { playing: boolean; provider?: string; caption: string };
  onSelectLanguage: (lang: LanguageCode) => void;
  onToggleDisability: (type: DisabilityType) => void;
  onToggleColorConfusion: (opt: ColorConfusionOption) => void;
  onToggleTheme: () => void;
  onTriggerVoice: (
    text: string,
    langOverride?: LanguageCode
  ) => Promise<VoicePlaybackResult>;
  onStopVoice: () => void;
  onCompleteOnboarding: (userInfo: {
    name: string;
    email: string;
    careerPlan: CareerPlan;
  }) => void;
}

const COLOR_CONFUSION_OPTIONS: Array<{ id: ColorConfusionOption; label: string }> = [
  { id: "red_green", label: "Red and green" },
  { id: "green_brown", label: "Green and brown" },
  { id: "blue_yellow", label: "Blue and yellow" },
  { id: "blue_purple", label: "Blue and purple" },
  { id: "most_colors", label: "Difficulty distinguishing many or most colors" },
  { id: "other", label: "Another color combination" },
  { id: "not_sure", label: "Not sure / configure later" },
];

interface QuestionConfig {
  id: OnboardingQuestionId;
  label: string;
  options?: string[];
  multi?: boolean;
}

const STEP3_QUESTIONS: QuestionConfig[] = [
  { id: "name", label: "Full name" },
  { id: "email", label: "Email address" },
  { id: "targetTrack", label: "Target career field", options: CAREER_TRACKS },
  { id: "targetRole", label: "Target role title" },
  {
    id: "experienceLevel",
    label: "Experience level",
    options: ["Beginner", "Entry-Level", "Intermediate", "Career Switcher"],
  },
  {
    id: "workStyle",
    label: "Preferred work style",
    options: ["Remote", "Hybrid", "On-site", "Internship"],
  },
  {
    id: "skills",
    label: "Skills you want to build",
    options: TARGET_SKILLS_POOL,
    multi: true,
  },
  { id: "goalStatement", label: "Personal career goal" },
  { id: "confirmSubmit", label: "Confirm & Enter Dashboard" },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  preferences,
  user,
  voiceStatus,
  onSelectLanguage,
  onToggleDisability,
  onToggleColorConfusion,
  onToggleTheme,
  onTriggerVoice,
  onStopVoice,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [careerPlan, setCareerPlan] = useState<CareerPlan>(user.careerPlan);
  const [formError, setFormError] = useState("");

  // Two-way voice Q&A states
  const [voiceQaActive, setVoiceQaActive] = useState(false);
  const [qaIndex, setQaIndex] = useState(0);
  const [listenState, setListenState] = useState<"idle" | "listening" | "transcribing">("idle");
  const [lastHeardTranscript, setLastHeardTranscript] = useState("");
  const [micError, setMicError] = useState("");
  const [fallbackAnswerInput, setFallbackAnswerInput] = useState("");

  const qaRunTokenRef = useRef(0);
  const stepRef = useRef(step);
  stepRef.current = step;
  const nameRef = useRef(name);
  nameRef.current = name;
  const emailRef = useRef(email);
  emailRef.current = email;
  const careerPlanRef = useRef(careerPlan);
  careerPlanRef.current = careerPlan;

  const t = TRANSLATIONS[preferences.language];
  const vs = VOICE_SCRIPTS[preferences.language];
  const isBlindSelected = preferences.disabilities.includes("blind");

  useEffect(() => {
    return () => {
      qaRunTokenRef.current += 1;
      stopActiveListening();
      onStopVoice();
    };
  }, [onStopVoice]);

  const submitFinalForm = useCallback(() => {
    qaRunTokenRef.current += 1;
    stopActiveListening();
    onStopVoice();
    onCompleteOnboarding({
      name: nameRef.current.trim() || "Abebe Bikila",
      email: emailRef.current.trim() || "learner@accesspath.org",
      careerPlan: careerPlanRef.current,
    });
  }, [onCompleteOnboarding, onStopVoice]);

  const applyExtractedAnswer = useCallback(
    (q: QuestionConfig, filledValue: string, matchedItems: string[]) => {
      if (q.id === "name" && filledValue) {
        setName(filledValue);
        nameRef.current = filledValue;
      } else if (q.id === "email" && filledValue) {
        setEmail(filledValue);
        emailRef.current = filledValue;
      } else if (q.id === "targetTrack" && filledValue) {
        const match = CAREER_TRACKS.find(
          (tr) => tr.toLowerCase() === filledValue.toLowerCase()
        ) || CAREER_TRACKS[0];
        setCareerPlan((p) => ({ ...p, targetTrack: match }));
      } else if (q.id === "targetRole" && filledValue) {
        setCareerPlan((p) => ({ ...p, targetRole: filledValue }));
      } else if (q.id === "experienceLevel" && filledValue) {
        const valid = ["Beginner", "Entry-Level", "Intermediate", "Career Switcher"];
        const match = (valid.find(
          (v) => v.toLowerCase() === filledValue.toLowerCase()
        ) || "Beginner") as CareerPlan["experienceLevel"];
        setCareerPlan((p) => ({ ...p, experienceLevel: match }));
      } else if (q.id === "workStyle" && filledValue) {
        const valid = ["Remote", "Hybrid", "On-site", "Internship"];
        const match = (valid.find(
          (v) => v.toLowerCase() === filledValue.toLowerCase()
        ) || "Remote") as CareerPlan["workStyle"];
        setCareerPlan((p) => ({ ...p, workStyle: match }));
      } else if (q.id === "skills") {
        const additions = matchedItems.length
          ? matchedItems
          : TARGET_SKILLS_POOL.filter((s) =>
              filledValue.toLowerCase().includes(s.toLowerCase())
            );
        if (additions.length > 0) {
          setCareerPlan((p) => ({
            ...p,
            skills: Array.from(new Set([...p.skills, ...additions])),
          }));
        }
      } else if (q.id === "goalStatement" && filledValue) {
        setCareerPlan((p) => ({ ...p, goalStatement: filledValue }));
      }
    },
    []
  );

  const runVoiceQuestionAt = useCallback(
    async (idx: number, token: number) => {
      if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;
      const clampedIdx = Math.max(0, Math.min(idx, STEP3_QUESTIONS.length - 1));
      const q = STEP3_QUESTIONS[clampedIdx];
      setQaIndex(clampedIdx);
      setMicError("");

      // 1. Ask the question aloud first
      await onTriggerVoice(vs.questions[q.id], preferences.language);
      if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;

      // 2. Listen to the user's spoken response
      const listenRes = await listenForUserSpeech({
        language: preferences.language,
        maxDurationMs: 8000,
        onStateChange: (st) => {
          if (qaRunTokenRef.current === token) setListenState(st);
        },
      });
      if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;

      if (listenRes.micError) {
        setMicError(listenRes.micError);
      }
      if (listenRes.cancelled) return;

      const spoken = listenRes.transcript.trim();
      if (!spoken) {
        // Speak gentle prompt and wait for user to tap Listen Now or type
        await onTriggerVoice(vs.didNotHearPrompt, preferences.language);
        return;
      }

      setLastHeardTranscript(spoken);

      // 3. Parse answer and fill the exact space on the form
      if (q.id === "confirmSubmit") {
        const lower = spoken.toLowerCase();
        if (/\b(repeat|back|review|no|stay|ድገም)\b/.test(lower)) {
          runVoiceQuestionAt(0, token);
          return;
        }
        if (
          /\b(submit|enter|dashboard|yes|ok|done|continue|ግባ|ቀጥል|itti fufi|sii wad)\b/.test(
            lower
          )
        ) {
          submitFinalForm();
          return;
        }
      }

      const intent = await interpretOnboardingVoiceAnswer({
        transcript: spoken,
        language: preferences.language,
        fieldContext: {
          fieldId: q.id,
          label: q.label,
          options: q.options,
          multi: q.multi,
        },
      });
      if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;

      if (intent.command === "repeat") {
        runVoiceQuestionAt(clampedIdx, token);
        return;
      }
      if (intent.command === "back") {
        runVoiceQuestionAt(Math.max(0, clampedIdx - 1), token);
        return;
      }
      if (intent.command === "submit") {
        submitFinalForm();
        return;
      }
      if (intent.command === "next") {
        if (clampedIdx + 1 < STEP3_QUESTIONS.length) {
          runVoiceQuestionAt(clampedIdx + 1, token);
        }
        return;
      }

      applyExtractedAnswer(q, intent.filledValue, intent.matchedItems);
      if (intent.confirmationText) {
        await onTriggerVoice(intent.confirmationText, preferences.language);
        if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;
      }

      if (clampedIdx + 1 < STEP3_QUESTIONS.length) {
        runVoiceQuestionAt(clampedIdx + 1, token);
      }
    },
    [
      applyExtractedAnswer,
      onTriggerVoice,
      preferences.language,
      submitFinalForm,
      vs.didNotHearPrompt,
      vs.questions,
    ]
  );

  const startStep3VoiceQa = useCallback(
    async (startIdx = 0) => {
      qaRunTokenRef.current += 1;
      const token = qaRunTokenRef.current;
      setVoiceQaActive(true);
      setMicError("");
      if (startIdx === 0) {
        await onTriggerVoice(vs.step3StartNotice, preferences.language);
        if (qaRunTokenRef.current !== token || stepRef.current !== 3) return;
      }
      runVoiceQuestionAt(startIdx, token);
    },
    [onTriggerVoice, preferences.language, runVoiceQuestionAt, vs.step3StartNotice]
  );

  const pauseStep3VoiceQa = useCallback(() => {
    qaRunTokenRef.current += 1;
    stopActiveListening();
    onStopVoice();
    setListenState("idle");
    setVoiceQaActive(false);
  }, [onStopVoice]);

  const handleFallbackTextAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const answerText = fallbackAnswerInput.trim();
    if (!answerText) return;
    setFallbackAnswerInput("");
    setLastHeardTranscript(answerText);
    const q = STEP3_QUESTIONS[qaIndex];

    if (q.id === "confirmSubmit") {
      if (/\b(submit|enter|yes|ok|done|continue|ግባ)\b/i.test(answerText)) {
        submitFinalForm();
      } else {
        startStep3VoiceQa(0);
      }
      return;
    }

    const intent = await interpretOnboardingVoiceAnswer({
      transcript: answerText,
      language: preferences.language,
      fieldContext: {
        fieldId: q.id,
        label: q.label,
        options: q.options,
        multi: q.multi,
      },
    });
    if (intent.command === "submit") {
      submitFinalForm();
      return;
    }
    if (intent.command !== "next" && intent.command !== "back" && intent.command !== "repeat") {
      applyExtractedAnswer(q, intent.filledValue, intent.matchedItems);
    }
    const nextIdx = Math.min(qaIndex + 1, STEP3_QUESTIONS.length - 1);
    if (voiceQaActive) {
      qaRunTokenRef.current += 1;
      runVoiceQuestionAt(nextIdx, qaRunTokenRef.current);
    } else {
      setQaIndex(nextIdx);
    }
  };

  const isDeafSelected = preferences.disabilities.includes("deaf");

  // Auto-start Voice Q&A on Step 3 for Blind users, or Chosen-Language AI Reader for Deaf users
  useEffect(() => {
    if (step === 3 && isBlindSelected) {
      const timer = window.setTimeout(() => {
        startStep3VoiceQa(0);
      }, 200);
      return () => {
        window.clearTimeout(timer);
        qaRunTokenRef.current += 1;
        stopActiveListening();
      };
    } else if (step === 3 && isDeafSelected && !isBlindSelected) {
      onTriggerVoice(
        `${t.onboarding.signInTitle}. ${t.onboarding.signInSubtitle} ${t.onboarding.careerPlanSubtitle}`,
        preferences.language
      );
    } else if (step !== 3) {
      setVoiceQaActive(false);
      setListenState("idle");
    }
  }, [
    step,
    isBlindSelected,
    isDeafSelected,
    startStep3VoiceQa,
    onTriggerVoice,
    preferences.language,
    t.onboarding.signInTitle,
    t.onboarding.signInSubtitle,
    t.onboarding.careerPlanSubtitle,
  ]);

  const handleDisabilityClick = async (type: DisabilityType) => {
    const wasSelected = preferences.disabilities.includes(type);
    onToggleDisability(type);
    // Instantly activate the Ethiopian/selected-language voice instructor upon selection
    if (!wasSelected) {
      if (type === "blind") {
        // Immediate two-way voice start for blind users: speak instruction & listen for "continue"
        qaRunTokenRef.current += 1;
        const token = qaRunTokenRef.current;
        const fullPrompt = `${t.disabilities.blind.instantVoiceInstruction} ${vs.step2BlindIntroAndPrompt}`;
        await onTriggerVoice(fullPrompt, preferences.language);
        if (qaRunTokenRef.current !== token || stepRef.current !== 2) return;

        const res = await listenForUserSpeech({
          language: preferences.language,
          maxDurationMs: 6500,
          onStateChange: (st) => {
            if (qaRunTokenRef.current === token) setListenState(st);
          },
        });
        if (qaRunTokenRef.current !== token || stepRef.current !== 2) return;
        if (res.micError) setMicError(res.micError);
        if (res.transcript.trim()) {
          setLastHeardTranscript(res.transcript.trim());
          const cmd = await interpretStep2VoiceCommand(
            res.transcript,
            preferences.language
          );
          if (cmd === "continue" && qaRunTokenRef.current === token) {
            setStep(3);
          } else if (cmd === "repeat" && qaRunTokenRef.current === token) {
            await onTriggerVoice(fullPrompt, preferences.language);
          }
        }
      } else {
        const instruction = t.disabilities[type].instantVoiceInstruction;
        onTriggerVoice(instruction, preferences.language);
      }
    }
  };

  const toggleSkill = (skill: string) => {
    setCareerPlan((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists
          ? prev.skills.filter((s) => s !== skill)
          : [...prev.skills, skill],
      };
    });
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your name or use the sample learner profile.");
      return;
    }
    setFormError("");
    qaRunTokenRef.current += 1;
    stopActiveListening();
    onStopVoice();
    onCompleteOnboarding({
      name: name.trim(),
      email: email.trim() || "learner@accesspath.org",
      careerPlan,
    });
  };

  const handleQuickDemo = () => {
    qaRunTokenRef.current += 1;
    stopActiveListening();
    onStopVoice();
    onCompleteOnboarding({
      name: name.trim() || "Abebe Bikila",
      email: email.trim() || "abebe@accesspath.org",
      careerPlan,
    });
  };

  const activeFieldId = voiceQaActive ? STEP3_QUESTIONS[qaIndex]?.id : null;

  const disabilityCards: Array<{
    type: DisabilityType;
    icon: React.ReactNode;
  }> = [
    { type: "deaf", icon: <Ear className="w-5 h-5" aria-hidden="true" /> },
    { type: "blind", icon: <Eye className="w-5 h-5" aria-hidden="true" /> },
    { type: "motor", icon: <Hand className="w-5 h-5" aria-hidden="true" /> },
    { type: "color", icon: <Palette className="w-5 h-5" aria-hidden="true" /> },
    { type: "standard", icon: <Compass className="w-5 h-5" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#E6EDF3] flex flex-col">
      {/* Clean 3-Zone Top Bar */}
      <header className="border-b border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <span className="font-['Courier_New',monospace] text-[#045221] text-[26px] font-bold tracking-tight whitespace-nowrap shrink-0">
            {t.brand}
          </span>

          <nav
            aria-label="Onboarding steps"
            className="hidden sm:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                step === 1
                  ? "text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                  : "text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#E6EDF3]"
              }`}
            >
              {t.onboarding.step1Label}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                step === 2
                  ? "text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                  : "text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#E6EDF3]"
              }`}
            >
              {t.onboarding.step2Label}
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                step === 3
                  ? "text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                  : "text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#E6EDF3]"
              }`}
            >
              {t.onboarding.step3Label}
            </button>
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              preferences.theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D] whitespace-nowrap shrink-0"
          >
            {preferences.theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" aria-hidden="true" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" aria-hidden="true" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {/* Live Voice Instructor, Mic Listening & Synchronized Caption Strip */}
        {(voiceStatus.caption || voiceStatus.playing || listenState !== "idle" || isBlindSelected) && (
          <section
            aria-live="polite"
            aria-label="Voice Instructor and Two-Way Voice Controls"
            className="mb-8 rounded-lg border border-[#0969DA]/40 dark:border-[#58A6FF]/40 bg-white dark:bg-[#161B22] p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF]">
                  {listenState === "listening" ? (
                    <Mic className="w-4 h-4 text-[#1A7F37] dark:text-[#3FB950]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>
                    {listenState === "listening"
                      ? vs.listeningLabel
                      : listenState === "transcribing"
                      ? vs.transcribingLabel
                      : voiceStatus.playing
                      ? vs.speakingLabel
                      : t.onboarding.voiceActiveNotice}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[#656D76] dark:text-[#8B949E]">
                    {voiceStatus.provider === "addis-ai"
                      ? "Addis AI Ethiopian Voice"
                      : voiceStatus.provider === "addis-ai-compatible-gemini"
                      ? "Ethiopian Voice Instructor"
                      : "Voice + Captions"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#1F2328] dark:text-[#E6EDF3]">
                  {voiceStatus.caption || t.disabilities.blind.instantVoiceInstruction}
                </p>
                {lastHeardTranscript && (
                  <p className="text-xs text-[#1A7F37] dark:text-[#3FB950] font-medium">
                    Heard: &ldquo;{lastHeardTranscript}&rdquo;
                  </p>
                )}
                {micError && (
                  <p role="alert" className="text-xs text-[#CF222E] dark:text-[#F85149]">
                    {micError}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {listenState === "listening" ? (
                  <button
                    type="button"
                    onClick={finishCurrentListeningNow}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-[#1A7F37] text-white hover:bg-[#116329] whitespace-nowrap"
                  >
                    <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{vs.doneSpeakingBtn}</span>
                  </button>
                ) : (
                  voiceStatus.caption && (
                    <button
                      type="button"
                      onClick={() =>
                        onTriggerVoice(voiceStatus.caption, preferences.language)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D] whitespace-nowrap"
                    >
                      <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.onboarding.replayVoiceBtn}</span>
                    </button>
                  )
                )}
                {voiceStatus.playing && (
                  <button
                    type="button"
                    onClick={() => {
                      qaRunTokenRef.current += 1;
                      stopActiveListening();
                      onStopVoice();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149] hover:bg-[#CF222E]/10 whitespace-nowrap"
                  >
                    <Square className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.onboarding.stopVoiceBtn}</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* STEP 1: LANGUAGE SELECTION FIRST */}
        {step === 1 && (
          <section aria-labelledby="step1-heading" className="space-y-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF]">
                {t.onboarding.step1Label}
              </p>
              <h1
                id="step1-heading"
                className="font-['Courier_New',monospace] text-2xl sm:text-3xl font-bold tracking-tight text-balance"
              >
                {t.onboarding.chooseLanguageTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#2c037e] font-bold">
                {t.onboarding.chooseLanguageSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LANGUAGES.map((lang) => {
                const selected = preferences.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    aria-pressed={selected}
                    className={`text-left p-5 rounded-lg border transition-colors min-h-[124px] flex flex-col justify-between ${
                      selected
                        ? "border-[#0969DA] dark:border-[#58A6FF] bg-[#0969DA]/5 dark:bg-[#58A6FF]/10"
                        : "border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-[#8C959F] dark:hover:border-[#6E7681]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-bold tracking-tight">
                          {lang.nativeName}
                        </div>
                        <div className="text-xs text-[#656D76] dark:text-[#8B949E] mt-0.5">
                          {lang.englishName} · {lang.regionNote}
                        </div>
                      </div>
                      {selected && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#0969DA] dark:bg-[#58A6FF] text-white dark:text-[#0D1117] shrink-0">
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div className="pt-4 text-xs text-[#656D76] dark:text-[#8B949E]">
                      <span className="font-medium text-[#1F2328] dark:text-[#E6EDF3]">
                        {lang.ttsLabel}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{lang.voiceSupportNote}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] transition-colors whitespace-nowrap"
              >
                <span>{t.onboarding.continueBtn}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: DISABILITY TYPE SELECTION + INSTANT VOICE INSTRUCTOR */}
        {step === 2 && (
          <section aria-labelledby="step2-heading" className="space-y-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF]">
                {t.onboarding.step2Label} · {LANGUAGES.find((l) => l.code === preferences.language)?.nativeName}
              </p>
              <h1
                id="step2-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-balance"
              >
                {t.onboarding.disabilityTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#656D76] dark:text-[#8B949E]">
                {t.onboarding.disabilitySubtitle}
              </p>
              <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                {t.onboarding.multiSelectHint}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disabilityCards.map(({ type, icon }) => {
                const selected = preferences.disabilities.includes(type);
                const copy = t.disabilities[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleDisabilityClick(type)}
                    aria-pressed={selected}
                    className={`text-left p-5 rounded-lg border transition-colors flex flex-col justify-between gap-3 ${
                      selected
                        ? "border-[#0969DA] dark:border-[#58A6FF] bg-[#0969DA]/5 dark:bg-[#58A6FF]/10"
                        : "border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:border-[#8C959F] dark:hover:border-[#6E7681]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] shrink-0">
                          {icon}
                        </span>
                        <span className="text-base font-semibold">
                          {copy.title}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md border shrink-0 ${
                          selected
                            ? "border-[#0969DA] bg-[#0969DA] text-white dark:border-[#58A6FF] dark:bg-[#58A6FF] dark:text-[#0D1117]"
                            : "border-[#D0D7DE] dark:border-[#30363D]"
                        }`}
                      >
                        {selected && <Check className="w-4 h-4" aria-hidden="true" />}
                      </span>
                    </div>
                    <p className="text-sm text-[#656D76] dark:text-[#8B949E] leading-relaxed">
                      {copy.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Color-vision deficiency multi-select follow-up */}
            {preferences.disabilities.includes("color") && (
              <div className="rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
                <h2 className="text-base font-semibold">
                  {t.onboarding.colorQuestion}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {COLOR_CONFUSION_OPTIONS.map((opt) => {
                    const checked = preferences.colorConfusions.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onToggleColorConfusion(opt.id)}
                        aria-pressed={checked}
                        className={`text-left px-3.5 py-2.5 rounded-md border text-sm flex items-center justify-between gap-2 ${
                          checked
                            ? "border-[#0969DA] bg-[#0969DA]/10 font-medium"
                            : "border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {checked && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>{t.onboarding.backBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap"
              >
                <span>{t.onboarding.continueBtn}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: SIGN IN & CAREER PLAN + VOICE Q&A FORM FILLER */}
        {step === 3 && (
          <section aria-labelledby="step3-heading" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF]">
                  {t.onboarding.step3Label}
                </p>
                <h1
                  id="step3-heading"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-balance"
                >
                  {t.onboarding.signInTitle}
                </h1>
                <p className="text-sm sm:text-base text-[#656D76] dark:text-[#8B949E]">
                  {t.onboarding.signInSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  voiceQaActive ? pauseStep3VoiceQa() : startStep3VoiceQa(qaIndex)
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border whitespace-nowrap shrink-0 ${
                  voiceQaActive
                    ? "border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149] bg-white dark:bg-[#161B22]"
                    : "border-[#0969DA] bg-[#0969DA] text-white"
                }`}
              >
                <Mic className="w-4 h-4" aria-hidden="true" />
                <span>{voiceQaActive ? vs.pauseVoiceBtn : vs.resumeVoiceBtn}</span>
              </button>
            </div>

            {/* Interactive Voice Q&A Bar: Ask -> Listen -> Fill */}
            <div
              role="region"
              aria-label="Voice Question and Answer Controller"
              className="rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF] flex items-center gap-2">
                    <span>
                      Question {qaIndex + 1} of {STEP3_QUESTIONS.length}:{" "}
                      {STEP3_QUESTIONS[qaIndex]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#1F2328] dark:text-[#E6EDF3]">
                    {vs.questions[STEP3_QUESTIONS[qaIndex].id]}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      qaRunTokenRef.current += 1;
                      setVoiceQaActive(true);
                      runVoiceQuestionAt(qaIndex, qaRunTokenRef.current);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] text-white hover:bg-[#0550AE]"
                  >
                    <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{vs.answerByVoiceBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerVoice(
                        vs.questions[STEP3_QUESTIONS[qaIndex].id],
                        preferences.language
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                  >
                    <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{vs.repeatBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(qaIndex + 1, STEP3_QUESTIONS.length - 1);
                      if (voiceQaActive) {
                        qaRunTokenRef.current += 1;
                        runVoiceQuestionAt(next, qaRunTokenRef.current);
                      } else {
                        setQaIndex(next);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                  >
                    <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{vs.skipBtn}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleFallbackTextAnswer} className="flex gap-2">
                <label htmlFor="voice-qa-fallback" className="sr-only">
                  Reply to current voice question
                </label>
                <input
                  id="voice-qa-fallback"
                  type="text"
                  value={fallbackAnswerInput}
                  onChange={(e) => setFallbackAnswerInput(e.target.value)}
                  placeholder={vs.voiceReplyPlaceholder}
                  className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D]"
                >
                  {vs.sendVoiceFallbackBtn}
                </button>
              </form>
            </div>

            <form
              onSubmit={handleStep3Submit}
              className="rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-6 space-y-6"
            >
              {/* Sign-in identity fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`rounded-md p-2 -m-2 transition-colors ${
                    activeFieldId === "name" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                  }`}
                >
                  <label
                    htmlFor="learner-name"
                    className="block text-sm font-medium mb-1.5"
                  >
                    {t.onboarding.fullNameLabel}
                  </label>
                  <input
                    id="learner-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Selamawit Tadesse"
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  />
                </div>
                <div
                  className={`rounded-md p-2 -m-2 transition-colors ${
                    activeFieldId === "email" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                  }`}
                >
                  <label
                    htmlFor="learner-email"
                    className="block text-sm font-medium mb-1.5"
                  >
                    {t.onboarding.emailLabel}
                  </label>
                  <input
                    id="learner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="selam@example.org"
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  />
                </div>
              </div>

              <hr className="border-[#D0D7DE] dark:border-[#30363D]" />

              {/* Career Plan Builder */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">
                    {t.onboarding.careerPlanHeading}
                  </h2>
                  <p className="text-xs text-[#656D76] dark:text-[#8B949E] mt-0.5">
                    {t.onboarding.careerPlanSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className={`rounded-md p-2 -m-2 transition-colors ${
                      activeFieldId === "targetTrack" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                    }`}
                  >
                    <label
                      htmlFor="career-track"
                      className="block text-sm font-medium mb-1.5"
                    >
                      {t.onboarding.targetTrackLabel}
                    </label>
                    <select
                      id="career-track"
                      value={careerPlan.targetTrack}
                      onChange={(e) =>
                        setCareerPlan((p) => ({ ...p, targetTrack: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    >
                      {CAREER_TRACKS.map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className={`rounded-md p-2 -m-2 transition-colors ${
                      activeFieldId === "targetRole" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                    }`}
                  >
                    <label
                      htmlFor="target-role"
                      className="block text-sm font-medium mb-1.5"
                    >
                      {t.onboarding.targetRoleLabel}
                    </label>
                    <input
                      id="target-role"
                      type="text"
                      value={careerPlan.targetRole}
                      onChange={(e) =>
                        setCareerPlan((p) => ({ ...p, targetRole: e.target.value }))
                      }
                      placeholder="e.g. Junior Frontend Engineer"
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    />
                  </div>

                  <div
                    className={`rounded-md p-2 -m-2 transition-colors ${
                      activeFieldId === "experienceLevel" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                    }`}
                  >
                    <label
                      htmlFor="experience-level"
                      className="block text-sm font-medium mb-1.5"
                    >
                      {t.onboarding.experienceLabel}
                    </label>
                    <select
                      id="experience-level"
                      value={careerPlan.experienceLevel}
                      onChange={(e) =>
                        setCareerPlan((p) => ({
                          ...p,
                          experienceLevel: e.target.value as CareerPlan["experienceLevel"],
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Career Switcher">Career Switcher</option>
                    </select>
                  </div>

                  <div
                    className={`rounded-md p-2 -m-2 transition-colors ${
                      activeFieldId === "workStyle" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                    }`}
                  >
                    <label
                      htmlFor="work-style"
                      className="block text-sm font-medium mb-1.5"
                    >
                      {t.onboarding.workStyleLabel}
                    </label>
                    <select
                      id="work-style"
                      value={careerPlan.workStyle}
                      onChange={(e) =>
                        setCareerPlan((p) => ({
                          ...p,
                          workStyle: e.target.value as CareerPlan["workStyle"],
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div
                  className={`rounded-md p-2 -m-2 transition-colors ${
                    activeFieldId === "skills" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                  }`}
                >
                  <span className="block text-sm font-medium mb-2">
                    {t.onboarding.skillsLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_SKILLS_POOL.map((skill) => {
                      const active = careerPlan.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          aria-pressed={active}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            active
                              ? "border-[#0969DA] bg-[#0969DA] text-white dark:border-[#58A6FF] dark:bg-[#58A6FF] dark:text-[#0D1117]"
                              : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D]"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`rounded-md p-2 -m-2 transition-colors ${
                    activeFieldId === "goalStatement" ? "ring-2 ring-[#0969DA] bg-[#0969DA]/5" : ""
                  }`}
                >
                  <label
                    htmlFor="career-goal"
                    className="block text-sm font-medium mb-1.5"
                  >
                    {t.onboarding.goalLabel}
                  </label>
                  <input
                    id="career-goal"
                    type="text"
                    value={careerPlan.goalStatement}
                    onChange={(e) =>
                      setCareerPlan((p) => ({ ...p, goalStatement: e.target.value }))
                    }
                    placeholder="e.g. Complete two Savannah accessibility courses and land a remote role within 4 months"
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  />
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="text-sm text-[#CF222E] dark:text-[#F85149] font-medium"
                >
                  {formError}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{t.onboarding.backBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
                  >
                    {t.onboarding.quickDemoBtn}
                  </button>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap"
                >
                  <span>{t.onboarding.enterDashboardBtn}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};
