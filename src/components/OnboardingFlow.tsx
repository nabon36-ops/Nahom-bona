import React, { useState } from "react";
import {
  AccessibilityPreferences,
  CareerPlan,
  ColorConfusionOption,
  DisabilityType,
  LanguageCode,
  UserProfile,
} from "../types";
import { LANGUAGES, TRANSLATIONS } from "../i18n/translations";
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
} from "lucide-react";

interface OnboardingFlowProps {
  preferences: AccessibilityPreferences;
  user: UserProfile;
  voiceStatus: { playing: boolean; provider?: string; caption: string };
  onSelectLanguage: (lang: LanguageCode) => void;
  onToggleDisability: (type: DisabilityType) => void;
  onToggleColorConfusion: (opt: ColorConfusionOption) => void;
  onToggleTheme: () => void;
  onTriggerVoice: (text: string, langOverride?: LanguageCode) => void;
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

  const t = TRANSLATIONS[preferences.language];

  const handleDisabilityClick = (type: DisabilityType) => {
    const wasSelected = preferences.disabilities.includes(type);
    onToggleDisability(type);
    // Instantly activate the Ethiopian/selected-language voice instructor upon selection
    if (!wasSelected) {
      const instruction = t.disabilities[type].instantVoiceInstruction;
      onTriggerVoice(instruction, preferences.language);
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
    onCompleteOnboarding({
      name: name.trim(),
      email: email.trim() || "learner@accesspath.org",
      careerPlan,
    });
  };

  const handleQuickDemo = () => {
    onCompleteOnboarding({
      name: name.trim() || "Abebe Bikila",
      email: email.trim() || "abebe@accesspath.org",
      careerPlan,
    });
  };

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
        {/* Live Voice Instructor & Synchronized Caption Strip */}
        {(voiceStatus.caption || voiceStatus.playing) && (
          <section
            aria-live="polite"
            aria-label="Voice Instructor Captions"
            className="mb-8 rounded-lg border border-[#0969DA]/40 dark:border-[#58A6FF]/40 bg-white dark:bg-[#161B22] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0969DA] dark:text-[#58A6FF]">
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>{t.onboarding.voiceActiveNotice}</span>
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
                {voiceStatus.caption}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
              {voiceStatus.playing && (
                <button
                  type="button"
                  onClick={onStopVoice}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149] hover:bg-[#CF222E]/10 whitespace-nowrap"
                >
                  <Square className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.onboarding.stopVoiceBtn}</span>
                </button>
              )}
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

        {/* STEP 3: SIGN IN & CAREER PLAN */}
        {step === 3 && (
          <section aria-labelledby="step3-heading" className="space-y-6">
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

            <form
              onSubmit={handleStep3Submit}
              className="rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-6 space-y-6"
            >
              {/* Sign-in identity fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
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
                <div>
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
                  <div>
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

                  <div>
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

                  <div>
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

                  <div>
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

                <div>
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

                <div>
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
