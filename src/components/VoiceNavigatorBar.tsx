import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityPreferences,
  ApplicationStatus,
  AppView,
  Course,
  JobApplication,
  LanguageCode,
  UserProfile,
} from "../types";
import { RankedCourse, RankedJob } from "../data/catalog";
import { VOICE_SCRIPTS } from "../i18n/voiceScripts";
import {
  finishCurrentListeningNow,
  interpretNavigationVoiceCommand,
  listenForUserSpeech,
  stopActiveListening,
  VoicePlaybackResult,
} from "../services/voiceService";
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  ListTree,
  ChevronRight,
  Send,
} from "lucide-react";

type HierarchyStage = "general" | "major" | "specific" | "idle";

interface VoiceNavigatorBarProps {
  enabled: boolean;
  autoStartSignal: number;
  preferences: AccessibilityPreferences;
  user: UserProfile;
  currentView: AppView;
  rankedCourses: RankedCourse[];
  rankedJobs: RankedJob[];
  enrolledCourseIds: string[];
  bookmarkedCourseIds: string[];
  courseProgress: Record<string, number>;
  applications: JobApplication[];
  learningHours: number;
  weeklyGoalHours: number;
  earnedBadgesCount: number;
  downloadedGuidesCount: number;
  streakDays: number;
  voiceStatus: { playing: boolean; provider?: string; caption: string };
  onNavigate: (view: AppView) => void;
  onEnrollCourse: (courseId: string) => void;
  onCompleteLesson: (course: Course) => void;
  onSaveOrApplyJob: (jobId: string, status: ApplicationStatus) => void;
  onCheckInToday: () => void;
  onTriggerVoice: (
    text: string,
    langOverride?: LanguageCode
  ) => Promise<VoicePlaybackResult>;
  onStopVoice: () => void;
  onToggleEnabled: () => void;
}

export const VoiceNavigatorBar: React.FC<VoiceNavigatorBarProps> = ({
  enabled,
  autoStartSignal,
  preferences,
  user,
  currentView,
  rankedCourses,
  rankedJobs,
  enrolledCourseIds,
  bookmarkedCourseIds,
  courseProgress,
  applications,
  learningHours,
  weeklyGoalHours,
  earnedBadgesCount,
  downloadedGuidesCount,
  streakDays,
  voiceStatus,
  onNavigate,
  onEnrollCourse,
  onCompleteLesson,
  onSaveOrApplyJob,
  onCheckInToday,
  onTriggerVoice,
  onStopVoice,
  onToggleEnabled,
}) => {
  const [stage, setStage] = useState<HierarchyStage>("idle");
  const [listenState, setListenState] = useState<
    "idle" | "listening" | "transcribing"
  >("idle");
  const [lastTranscript, setLastTranscript] = useState("");
  const [micError, setMicError] = useState("");
  const [commandInput, setCommandInput] = useState("");

  const sessionTokenRef = useRef(0);
  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;

  const vs = VOICE_SCRIPTS[preferences.language];

  const buildSpecificSummary = useCallback(
    (target: AppView): string => {
      if (target === "courses") {
        const top3 = rankedCourses.slice(0, 3);
        const list = top3
          .map((item, idx) => {
            const done = courseProgress[item.course.id] || 0;
            const enrolled = enrolledCourseIds.includes(item.course.id)
              ? `enrolled, ${done} of ${item.course.lessonsCount} lessons done`
              : "not enrolled yet";
            return `Course ${idx + 1}: ${item.course.title}, ${item.course.durationHours} hours, ${enrolled}`;
          })
          .join(". ");
        return `Courses view. ${list}. ${vs.specificPromptSuffix}`;
      }
      if (target === "jobs") {
        const top3 = rankedJobs.slice(0, 3);
        const list = top3
          .map(
            (item, idx) =>
              `Job ${idx + 1}: ${item.job.title} at ${item.job.company}, ${item.job.workMode}`
          )
          .join(". ");
        return `Jobs view. ${list}. Say 'save 1', 'apply 1', or 'major options'.`;
      }
      if (target === "progress") {
        return `Progress view. ${learningHours} hours logged toward your ${weeklyGoalHours} hour weekly goal. ${earnedBadgesCount} achievement badges unlocked. ${vs.specificPromptSuffix}`;
      }
      if (target === "resources") {
        return `Learning Resources view. ${bookmarkedCourseIds.length} bookmarked courses and ${downloadedGuidesCount} downloaded study guides ready. ${vs.specificPromptSuffix}`;
      }
      if (target === "tracker") {
        if (applications.length === 0) {
          return `Job Tracker view. You have no tracked applications yet. Say 'jobs' to browse recommended opportunities, or 'major options'.`;
        }
        return `Job Tracker view. You have ${applications.length} tracked job applications. ${vs.specificPromptSuffix}`;
      }
      if (target === "linkedin") {
        return `LinkedIn Profile view. Ready to generate a tailored headline, bio, or milestone post for ${user.careerPlan.targetRole}. ${vs.specificPromptSuffix}`;
      }
      if (target === "assistant") {
        return `AI Career Assistant view. Ask any career, course, or skill-gap question aloud now.`;
      }
      if (target === "settings") {
        return `Settings view. Language is ${preferences.language}, text scale is ${Math.round(
          preferences.textScale * 100
        )} percent, theme is ${preferences.theme}. ${vs.specificPromptSuffix}`;
      }

      const activeCourse =
        rankedCourses.find((r) => enrolledCourseIds.includes(r.course.id))?.course ||
        rankedCourses[0]?.course;
      const topJob = rankedJobs[0]?.job;
      return `Dashboard details: Daily streak is ${streakDays} days. ${learningHours} of ${weeklyGoalHours} weekly hours completed. Top active course: ${
        activeCourse?.title || "None"
      }. Top recommended job: ${topJob?.title || "None"} at ${
        topJob?.company || ""
      }. ${vs.specificPromptSuffix}`;
    },
    [
      applications.length,
      bookmarkedCourseIds.length,
      courseProgress,
      downloadedGuidesCount,
      earnedBadgesCount,
      enrolledCourseIds,
      learningHours,
      preferences.language,
      preferences.textScale,
      preferences.theme,
      rankedCourses,
      rankedJobs,
      streakDays,
      user.careerPlan.targetRole,
      vs.specificPromptSuffix,
      weeklyGoalHours,
    ]
  );

  const handleUserCommand = useCallback(
    async (transcript: string, token: number) => {
      if (sessionTokenRef.current !== token) return;
      const clean = transcript.trim();
      if (!clean) return;
      setLastTranscript(clean);

      const contextSummary = buildSpecificSummary(currentViewRef.current);
      const intent = await interpretNavigationVoiceCommand({
        transcript: clean,
        language: preferences.language,
        currentView: currentViewRef.current,
        contextSummary,
      });

      if (sessionTokenRef.current !== token) return;

      if (intent.action === "stop") {
        sessionTokenRef.current += 1;
        stopActiveListening();
        setListenState("idle");
        setStage("idle");
        await onTriggerVoice(
          intent.replyText || "Voice navigation paused.",
          preferences.language
        );
        return;
      }

      if (intent.action === "read_major_options") {
        await runMajorOptionsCycle(token);
        return;
      }

      if (intent.action === "read_specific") {
        await runSpecificCycle(currentViewRef.current, token);
        return;
      }

      if (intent.action === "navigate" && intent.targetView) {
        onNavigate(intent.targetView);
        await runSpecificCycle(intent.targetView, token);
        return;
      }

      if (intent.action === "enroll_course") {
        const idx = Math.max(0, (intent.itemNumber || 1) - 1);
        const picked = rankedCourses[idx]?.course || rankedCourses[0]?.course;
        if (picked) {
          onEnrollCourse(picked.id);
          onNavigate("courses");
          await onTriggerVoice(
            `Enrolled in ${picked.title}. ${vs.specificPromptSuffix}`,
            preferences.language
          );
        }
        await listenAndHandle(token);
        return;
      }

      if (intent.action === "complete_lesson") {
        const activeCourse =
          rankedCourses.find(
            (r) =>
              enrolledCourseIds.includes(r.course.id) &&
              (courseProgress[r.course.id] || 0) < r.course.lessonsCount
          )?.course || rankedCourses[0]?.course;
        if (activeCourse) {
          onCompleteLesson(activeCourse);
          await onTriggerVoice(
            `Completed next lesson in ${activeCourse.title}. ${vs.specificPromptSuffix}`,
            preferences.language
          );
        }
        await listenAndHandle(token);
        return;
      }

      if (intent.action === "save_job" || intent.action === "apply_job") {
        const idx = Math.max(0, (intent.itemNumber || 1) - 1);
        const picked = rankedJobs[idx]?.job || rankedJobs[0]?.job;
        if (picked) {
          const nextStatus: ApplicationStatus =
            intent.action === "apply_job" ? "Applied" : "Saved";
          onSaveOrApplyJob(picked.id, nextStatus);
          await onTriggerVoice(
            `${nextStatus} ${picked.title} at ${picked.company}. ${vs.specificPromptSuffix}`,
            preferences.language
          );
        }
        await listenAndHandle(token);
        return;
      }

      if (intent.action === "check_in") {
        onCheckInToday();
        await onTriggerVoice(
          `Daily learning check-in recorded. ${vs.specificPromptSuffix}`,
          preferences.language
        );
        await listenAndHandle(token);
        return;
      }

      if (intent.action === "ask_ai") {
        const query = intent.queryText || clean;
        try {
          const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: query,
              language: preferences.language,
              disabilityProfiles: preferences.disabilities,
              careerPlan: user.careerPlan,
              courses: rankedCourses.slice(0, 4).map((r) => ({
                id: r.course.id,
                title: r.course.title,
                field: r.course.field,
                skills: r.course.skills,
              })),
              jobs: rankedJobs.slice(0, 4).map((r) => ({
                id: r.job.id,
                title: r.job.title,
                company: r.job.company,
                track: r.job.track,
              })),
            }),
          });
          if (res.ok && sessionTokenRef.current === token) {
            const data = (await res.json()) as { reply?: string };
            await onTriggerVoice(
              `${data.reply || ""} ${vs.specificPromptSuffix}`,
              preferences.language
            );
            await listenAndHandle(token);
            return;
          }
        } catch {
          // Ignore and speak fallback below
        }
      }

      if (intent.replyText) {
        await onTriggerVoice(intent.replyText, preferences.language);
      }
      await listenAndHandle(token);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      buildSpecificSummary,
      courseProgress,
      enrolledCourseIds,
      onCheckInToday,
      onCompleteLesson,
      onEnrollCourse,
      onNavigate,
      onSaveOrApplyJob,
      onTriggerVoice,
      preferences.disabilities,
      preferences.language,
      rankedCourses,
      rankedJobs,
      user.careerPlan,
      vs.specificPromptSuffix,
    ]
  );

  const listenAndHandle = useCallback(
    async (token: number) => {
      if (sessionTokenRef.current !== token) return;
      setMicError("");
      const res = await listenForUserSpeech({
        language: preferences.language,
        maxDurationMs: 8000,
        onStateChange: (st) => {
          if (sessionTokenRef.current === token) setListenState(st);
        },
      });
      if (sessionTokenRef.current !== token) return;
      if (res.micError) setMicError(res.micError);
      if (res.cancelled) return;

      const spoken = res.transcript.trim();
      if (!spoken) {
        // Speak short cue and stop auto-looping silently until user clicks Listen Now or uses command box
        return;
      }
      await handleUserCommand(spoken, token);
    },
    [handleUserCommand, preferences.language]
  );

  const runMajorOptionsCycle = useCallback(
    async (token: number) => {
      if (sessionTokenRef.current !== token) return;
      setStage("major");
      await onTriggerVoice(vs.majorOptionsPrompt, preferences.language);
      await listenAndHandle(token);
    },
    [listenAndHandle, onTriggerVoice, preferences.language, vs.majorOptionsPrompt]
  );

  const runSpecificCycle = useCallback(
    async (target: AppView, token: number) => {
      if (sessionTokenRef.current !== token) return;
      setStage("specific");
      const summary = buildSpecificSummary(target);
      await onTriggerVoice(summary, preferences.language);
      await listenAndHandle(token);
    },
    [buildSpecificSummary, listenAndHandle, onTriggerVoice, preferences.language]
  );

  const startHierarchicalSequence = useCallback(async () => {
    sessionTokenRef.current += 1;
    const token = sessionTokenRef.current;
    setMicError("");

    // Step 1: General overview
    setStage("general");
    const generalMsg = vs.generalWelcome(
      user.name || "Learner",
      user.careerPlan.targetRole
    );
    await onTriggerVoice(generalMsg, preferences.language);
    if (sessionTokenRef.current !== token) return;

    // Step 2: Major options -> Listen -> Go to specific
    await runMajorOptionsCycle(token);
  }, [
    onTriggerVoice,
    preferences.language,
    runMajorOptionsCycle,
    user.careerPlan.targetRole,
    user.name,
    vs,
  ]);

  // Trigger automatically after Sign In (or Alt+V signal) when Blind / voice mode is active
  useEffect(() => {
    if (!enabled || autoStartSignal === 0) return;
    const timer = window.setTimeout(() => {
      startHierarchicalSequence();
    }, 350);
    return () => {
      window.clearTimeout(timer);
      sessionTokenRef.current += 1;
      stopActiveListening();
    };
  }, [enabled, autoStartSignal, startHierarchicalSequence]);

  useEffect(() => {
    return () => {
      sessionTokenRef.current += 1;
      stopActiveListening();
    };
  }, []);

  if (!enabled) {
    return null;
  }

  const handleManualCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commandInput.trim();
    if (!text) return;
    setCommandInput("");
    sessionTokenRef.current += 1;
    const token = sessionTokenRef.current;
    stopActiveListening();
    await handleUserCommand(text, token);
  };

  return (
    <section
      aria-label="Hands-Free Voice Assistant Navigator"
      className="border-b border-[#0969DA]/30 dark:border-[#58A6FF]/30 bg-white dark:bg-[#161B22]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <ListTree
                className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]"
                aria-hidden="true"
              />
              <span className="text-[#0969DA] dark:text-[#58A6FF]">
                Voice Navigator
              </span>
              <span className="inline-flex items-center gap-1 text-[#656D76] dark:text-[#8B949E] font-normal">
                <span
                  className={
                    stage === "general"
                      ? "font-semibold text-[#1F2328] dark:text-[#E6EDF3]"
                      : ""
                  }
                >
                  General
                </span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span
                  className={
                    stage === "major"
                      ? "font-semibold text-[#1F2328] dark:text-[#E6EDF3]"
                      : ""
                  }
                >
                  Major Options
                </span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
                <span
                  className={
                    stage === "specific"
                      ? "font-semibold text-[#1F2328] dark:text-[#E6EDF3]"
                      : ""
                  }
                >
                  Specific Items
                </span>
              </span>
              <span className="font-mono text-[11px] text-[#1A7F37] dark:text-[#3FB950]">
                {listenState === "listening"
                  ? vs.listeningForChoice
                  : listenState === "transcribing"
                  ? vs.transcribingLabel
                  : voiceStatus.playing
                  ? "Speaking..."
                  : "Ready"}
              </span>
            </div>

            {voiceStatus.caption && (
              <p className="text-xs text-[#1F2328] dark:text-[#E6EDF3] leading-relaxed">
                {voiceStatus.caption}
              </p>
            )}
            {lastTranscript && (
              <p className="text-[11px] text-[#1A7F37] dark:text-[#3FB950] font-medium">
                Your voice response: &ldquo;{lastTranscript}&rdquo;
              </p>
            )}
            {micError && (
              <p role="alert" className="text-[11px] text-[#CF222E] dark:text-[#F85149]">
                {micError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {listenState === "listening" ? (
              <button
                type="button"
                onClick={finishCurrentListeningNow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A7F37] text-white hover:bg-[#116329]"
              >
                <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{vs.doneSpeakingBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sessionTokenRef.current += 1;
                  listenAndHandle(sessionTokenRef.current);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] text-white hover:bg-[#0550AE]"
              >
                <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{vs.answerByVoiceBtn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sessionTokenRef.current += 1;
                runMajorOptionsCycle(sessionTokenRef.current);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Major Options</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionTokenRef.current += 1;
                runSpecificCycle(currentView, sessionTokenRef.current);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Specific Items</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionTokenRef.current += 1;
                stopActiveListening();
                onStopVoice();
                setListenState("idle");
                setStage("idle");
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149]"
            >
              <Square className="w-3 h-3" aria-hidden="true" />
              <span>Stop</span>
            </button>

            <button
              type="button"
              onClick={onToggleEnabled}
              className="px-2 py-1.5 text-[11px] text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328]"
            >
              Hide
            </button>
          </div>
        </div>

        <form onSubmit={handleManualCommandSubmit} className="flex gap-2">
          <label htmlFor="voice-nav-cmd-input" className="sr-only">
            Type or speak a voice navigation command
          </label>
          <input
            id="voice-nav-cmd-input"
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Voice command fallback: e.g. 'Courses', 'Jobs', 'enroll 1', 'complete lesson', 'major options'..."
            className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D]"
          >
            <Send className="w-3 h-3" aria-hidden="true" />
            <span>Go</span>
          </button>
        </form>
      </div>
    </section>
  );
};
