import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibilityPreferences,
  ApplicationStatus,
  AppView,
  CareerPlan,
  ColorConfusionOption,
  Course,
  DisabilityType,
  JobApplication,
  LanguageCode,
  MilestoneNotification,
  SignDetectionResult,
  StudyGuide,
  UserProfile,
} from "./types";
import { LANGUAGES, TRANSLATIONS } from "./i18n/translations";
import {
  EXAMPLE_JOBS,
  SAVANNAH_DEMO_COURSES,
  SAVANNAH_STUDY_GUIDES,
  rankCoursesByCareerPlan,
  rankJobsByCareerPlan,
} from "./data/catalog";
import { evaluateBadges } from "./data/badges";
import {
  speakEthiopianInstruction,
  stopAllVoicePlayback,
  VoicePlaybackResult,
} from "./services/voiceService";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { SignLanguageDock } from "./components/SignLanguageDock";
import { VoiceNavigatorBar } from "./components/VoiceNavigatorBar";
import { MultilingualAICommunicator } from "./components/MultilingualAICommunicator";
import { DashboardView } from "./components/DashboardView";
import { CoursesView } from "./components/CoursesView";
import { ResourcesView } from "./components/ResourcesView";
import { JobsView, TrackerView } from "./components/JobsAndTrackerViews";
import {
  LinkedInView,
  ProgressView,
} from "./components/ProgressAndLinkedInViews";
import {
  AssistantView,
  SettingsView,
} from "./components/AssistantAndSettingsViews";
import { BlindVisualAssistantView } from "./components/BlindVisualAssistantView";
import { CareerPlanModal } from "./components/CareerPlanModal";
import {
  Sun,
  Moon,
  Volume2,
  Square,
  CheckCircle2,
  Eye,
  Globe,
  Mic,
  BookOpenText,
} from "lucide-react";

const STORAGE_KEY = "accesspath_state_v1";

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  language: "en",
  disabilities: [],
  colorConfusions: [],
  theme: "light",
  textScale: 1,
  highContrast: false,
  reducedMotion: false,
  captionsEnabled: true,
  voiceInstructorEnabled: true,
  signLanguageSystem: "EthSL",
  signDockOpen: false,
  screenReaderVerbosity: "standard",
  speechRate: 0.95,
};

const DEFAULT_USER: UserProfile = {
  signedIn: false,
  name: "",
  email: "",
  careerPlan: {
    targetTrack: "Full-Stack Web & Accessibility",
    targetRole: "Junior Frontend & Accessibility Engineer",
    experienceLevel: "Beginner",
    workStyle: "Remote",
    skills: ["React", "TypeScript", "WCAG Accessibility"],
    goalStatement:
      "Master accessible web development on Savannah and transition into a remote engineering role.",
  },
};

function getIsoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    savedState?.preferences || DEFAULT_PREFERENCES
  );
  const [user, setUser] = useState<UserProfile>(
    savedState?.user || DEFAULT_USER
  );
  const [view, setView] = useState<AppView>(savedState?.view || "dashboard");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(
    savedState?.enrolledCourseIds || ["sav-web-101"]
  );
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>(
    savedState?.bookmarkedCourseIds || ["sav-ux-105"]
  );
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(
    savedState?.courseProgress || { "sav-web-101": 2 }
  );
  const [applications, setApplications] = useState<JobApplication[]>(
    savedState?.applications || []
  );
  const [milestones, setMilestones] = useState<MilestoneNotification[]>(
    savedState?.milestones || [
      {
        id: "m-init",
        title: "Welcome to AccessPath",
        message: "Language, accessibility profile, and Career Plan configured.",
        timestamp: "Today",
      },
    ]
  );
  const [learningHours, setLearningHours] = useState<number>(
    savedState?.learningHours ?? 4.5
  );
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(
    savedState?.weeklyGoalHours ?? 8
  );
  const [earnedBadges, setEarnedBadges] = useState<Record<string, string>>(
    savedState?.earnedBadges || {}
  );
  const [activityDates, setActivityDates] = useState<string[]>(
    savedState?.activityDates || [getIsoDateOffset(-2), getIsoDateOffset(-1)]
  );
  const [bookmarkedGuideIds, setBookmarkedGuideIds] = useState<string[]>(
    savedState?.bookmarkedGuideIds || ["guide-color-safe-ui"]
  );
  const [downloadedGuides, setDownloadedGuides] = useState<Record<string, string>>(
    savedState?.downloadedGuides || {
      "guide-wcag-checklist": getIsoDateOffset(0),
    }
  );

  const [voiceStatus, setVoiceStatus] = useState<{
    playing: boolean;
    provider?: string;
    caption: string;
  }>({ playing: false, caption: "" });

  const [appreciationToast, setAppreciationToast] = useState<string | null>(
    null
  );
  const [careerModalOpen, setCareerModalOpen] = useState(false);
  const [voiceNavigatorOpen, setVoiceNavigatorOpen] = useState<boolean>(() =>
    (savedState?.preferences?.disabilities || []).includes("blind")
  );
  const [aiCommunicatorOpen, setAiCommunicatorOpen] = useState<boolean>(() => {
    const prefs = savedState?.preferences;
    return Boolean(
      prefs?.disabilities?.includes("deaf") ||
        (prefs?.language && prefs.language !== "en")
    );
  });
  const [voiceAutoStartSignal, setVoiceAutoStartSignal] = useState<number>(0);

  // Persist user preferences & learning progress
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          preferences,
          user,
          view,
          enrolledCourseIds,
          bookmarkedCourseIds,
          courseProgress,
          applications,
          milestones,
          learningHours,
          weeklyGoalHours,
          earnedBadges,
          activityDates,
          bookmarkedGuideIds,
          downloadedGuides,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    preferences,
    user,
    view,
    enrolledCourseIds,
    bookmarkedCourseIds,
    courseProgress,
    applications,
    milestones,
    learningHours,
    weeklyGoalHours,
    earnedBadges,
    activityDates,
    bookmarkedGuideIds,
    downloadedGuides,
  ]);

  // Apply root theme, text scale, contrast, reduced motion & color-vision deficiency classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", preferences.theme === "dark");
    root.classList.toggle("reduce-motion", preferences.reducedMotion);
    root.classList.toggle("high-contrast", preferences.highContrast);
    root.style.setProperty("--access-font-scale", String(preferences.textScale));

    root.classList.remove(
      "cvd-deuteranopia",
      "cvd-tritanopia",
      "cvd-achromatopsia"
    );
    if (preferences.colorConfusions.includes("most_colors")) {
      root.classList.add("cvd-achromatopsia");
    } else if (
      preferences.colorConfusions.includes("red_green") ||
      preferences.colorConfusions.includes("green_brown")
    ) {
      root.classList.add("cvd-deuteranopia");
    } else if (
      preferences.colorConfusions.includes("blue_yellow") ||
      preferences.colorConfusions.includes("blue_purple")
    ) {
      root.classList.add("cvd-tritanopia");
    }
  }, [preferences]);

  const t = TRANSLATIONS[preferences.language];

  const triggerVoice = useCallback(
    (text: string, langOverride?: LanguageCode): Promise<VoicePlaybackResult> => {
      const targetLang = langOverride || preferences.language;
      return speakEthiopianInstruction(
        text,
        targetLang,
        (status) => {
          setVoiceStatus(status);
        },
        { rate: preferences.speechRate ?? 0.95 }
      );
    },
    [preferences.language, preferences.speechRate]
  );

  // Keyboard shortcuts: Alt+R to read page guidance, Alt+V to start Voice Navigator, Alt+A to open Visual Assistant
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        triggerVoice(
          `Current view: ${view}. Target role: ${user.careerPlan.targetRole}.`
        );
      } else if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setVoiceNavigatorOpen(true);
        setVoiceAutoStartSignal((s) => s + 1);
      } else if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setView("vision");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, user.careerPlan.targetRole, triggerVoice]);

  const handleSelectLanguage = (lang: LanguageCode) => {
    setPreferences((p) => ({ ...p, language: lang }));
    if (lang !== "en") {
      setAiCommunicatorOpen(true);
    }
  };

  const handleToggleDisability = (type: DisabilityType) => {
    setPreferences((prev) => {
      const exists = prev.disabilities.includes(type);
      const nextDisabilities = exists
        ? prev.disabilities.filter((d) => d !== type)
        : type === "standard"
        ? ["standard" as DisabilityType]
        : [...prev.disabilities.filter((d) => d !== "standard"), type];

      if (nextDisabilities.includes("blind")) {
        setVoiceNavigatorOpen(true);
      }
      if (nextDisabilities.includes("deaf")) {
        setAiCommunicatorOpen(true);
      }

      return {
        ...prev,
        disabilities: nextDisabilities,
        captionsEnabled:
          nextDisabilities.includes("deaf") || prev.captionsEnabled,
        voiceInstructorEnabled:
          nextDisabilities.includes("blind") || prev.voiceInstructorEnabled,
        signDockOpen: nextDisabilities.includes("deaf")
          ? true
          : prev.signDockOpen,
      };
    });
  };

  const handleToggleColorConfusion = (opt: ColorConfusionOption) => {
    setPreferences((prev) => ({
      ...prev,
      colorConfusions: prev.colorConfusions.includes(opt)
        ? prev.colorConfusions.filter((c) => c !== opt)
        : [...prev.colorConfusions, opt],
    }));
  };

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    val: AccessibilityPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: val }));
  };

  // Career Plan Ranked Recommendations
  const rankedCourses = useMemo(
    () => rankCoursesByCareerPlan(SAVANNAH_DEMO_COURSES, user.careerPlan),
    [user.careerPlan]
  );

  const completedCourses = useMemo(
    () =>
      SAVANNAH_DEMO_COURSES.filter(
        (c) => (courseProgress[c.id] || 0) >= c.lessonsCount
      ),
    [courseProgress]
  );

  const completedSkills = useMemo(
    () => Array.from(new Set(completedCourses.flatMap((c) => c.skills))),
    [completedCourses]
  );

  const rankedJobs = useMemo(
    () => rankJobsByCareerPlan(EXAMPLE_JOBS, user.careerPlan, completedSkills),
    [user.careerPlan, completedSkills]
  );

  const streakDays = useMemo(() => {
    if (activityDates.length === 0) return 0;
    const set = new Set(activityDates);
    let count = 0;
    const today = getIsoDateOffset(0);
    let offset = set.has(today) ? 0 : -1;
    while (set.has(getIsoDateOffset(offset))) {
      count += 1;
      offset -= 1;
    }
    return count;
  }, [activityDates]);

  const currentPageSummary = useMemo(() => {
    const topCourses = rankedCourses
      .slice(0, 3)
      .map((r) => `${r.course.title} (${r.matchScore}% match)`)
      .join(", ");
    const topJobs = rankedJobs
      .slice(0, 3)
      .map((r) => `${r.job.title} at ${r.job.company} (${r.matchScore}% match)`)
      .join(", ");

    switch (view) {
      case "dashboard":
        return `Dashboard for ${user.name || "Learner"}. Career Plan: ${user.careerPlan.targetRole} (${user.careerPlan.targetTrack}). Daily streak: ${streakDays} days. Learning hours: ${learningHours}h / ${weeklyGoalHours}h weekly goal. Top recommended courses: ${topCourses}. Top recommended jobs: ${topJobs}.`;
      case "courses":
        return `Courses & ${preferences.signLanguageSystem} Sign Language Basics tutorials. Enrolled in ${enrolledCourseIds.length} courses. Top courses: ${topCourses}.`;
      case "resources":
        return `Learning Resources hub with ${bookmarkedCourseIds.length} bookmarked courses, ${bookmarkedGuideIds.length} bookmarked guides, and ${Object.keys(downloadedGuides).length} downloaded study guides.`;
      case "progress":
        return `Progress & Achievements: ${learningHours}h logged of ${weeklyGoalHours}h weekly goal, ${Object.keys(earnedBadges).length} badges unlocked, ${applications.length} tracked applications.`;
      case "jobs":
        return `Job Recommendations tailored for ${user.careerPlan.targetRole} (${user.careerPlan.workStyle}): ${topJobs}.`;
      case "tracker":
        return `Job Application Tracker with ${applications.length} tracked jobs across Saved, Applied, Interviewing, and Offered stages.`;
      case "linkedin":
        return `LinkedIn Profile Builder for ${user.careerPlan.targetRole} highlighting skills: ${user.careerPlan.skills.join(", ")}.`;
      case "assistant":
        return `Multilingual AI Career Assistant ready to answer learning and career questions for ${user.careerPlan.targetRole}.`;
      case "vision":
        return `Multilingual AI Visual Assistant for blind and visually impaired users with live camera description, text reading, hazard notices, and voice conversation.`;
      case "settings":
        return `Accessibility & Language Settings: current language ${preferences.language}, sign system ${preferences.signLanguageSystem}, captions ${preferences.captionsEnabled ? "on" : "off"}.`;
      default:
        return `AccessPath workspace view ${view}.`;
    }
  }, [
    applications.length,
    bookmarkedCourseIds.length,
    bookmarkedGuideIds.length,
    downloadedGuides,
    earnedBadges,
    enrolledCourseIds.length,
    learningHours,
    preferences.captionsEnabled,
    preferences.language,
    preferences.signLanguageSystem,
    rankedCourses,
    rankedJobs,
    streakDays,
    user.careerPlan.skills,
    user.careerPlan.targetRole,
    user.careerPlan.targetTrack,
    user.careerPlan.workStyle,
    user.name,
    view,
    weeklyGoalHours,
  ]);

  const handleUpdateCaption = useCallback((cap: string) => {
    setVoiceStatus((prev) => ({ ...prev, caption: cap }));
  }, []);

  const handleSpeakText = useCallback(
    (txt: string) => {
      triggerVoice(txt);
    },
    [triggerVoice]
  );

  const handleHideAiCommunicator = useCallback(() => {
    setAiCommunicatorOpen(false);
  }, []);

  // Automatically award virtual achievement badges when milestones or job application phases are reached
  useEffect(() => {
    const evaluated = evaluateBadges({
      user,
      courses: SAVANNAH_DEMO_COURSES,
      courseProgress,
      applications,
      learningHours,
      weeklyGoalHours,
      earnedBadges,
    });
    const newlyUnlocked = evaluated.filter(
      (item) => item.unlocked && !earnedBadges[item.badge.id]
    );
    if (newlyUnlocked.length > 0) {
      const todayLabel = new Date().toISOString().slice(0, 10);
      setEarnedBadges((prev) => {
        const next = { ...prev };
        newlyUnlocked.forEach((item) => {
          next[item.badge.id] = todayLabel;
        });
        return next;
      });
      if (user.signedIn) {
        const latest = newlyUnlocked[newlyUnlocked.length - 1];
        setAppreciationToast(
          `Badge unlocked: ${latest.badge.title} — ${latest.badge.description}`
        );
        setMilestones((prev) => [
          ...newlyUnlocked.map((item) => ({
            id: `badge-${item.badge.id}-${Date.now()}`,
            title: `Badge Earned: ${item.badge.title}`,
            message: item.badge.description,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
          ...prev,
        ]);
      }
    }
  }, [
    user,
    courseProgress,
    applications,
    learningHours,
    weeklyGoalHours,
    earnedBadges,
  ]);

  const showAppreciation = (msg: string, title: string) => {
    setAppreciationToast(msg);
    setMilestones((prev) => [
      {
        id: `m-${Date.now()}`,
        title,
        message: msg,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    window.setTimeout(() => {
      setAppreciationToast((curr) => (curr === msg ? null : curr));
    }, 5000);
  };

  const recordDailyActivity = useCallback(() => {
    const today = getIsoDateOffset(0);
    setActivityDates((prev) => (prev.includes(today) ? prev : [...prev, today]));
  }, []);

  const handleCheckInToday = () => {
    const today = getIsoDateOffset(0);
    if (!activityDates.includes(today)) {
      recordDailyActivity();
      showAppreciation(
        "Daily learning check-in recorded! Keep building steady momentum.",
        "Daily Streak Updated"
      );
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    recordDailyActivity();
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds((prev) => [...prev, courseId]);
      const course = SAVANNAH_DEMO_COURSES.find((c) => c.id === courseId);
      if (course) {
        showAppreciation(
          `Started "${course.title}". Learn at your own pace!`,
          "Course Started"
        );
      }
    }
  };

  const handleCompleteLesson = (course: Course) => {
    recordDailyActivity();
    const current = courseProgress[course.id] || 0;
    if (current >= course.lessonsCount) return;
    const nextCount = current + 1;
    setCourseProgress((prev) => ({ ...prev, [course.id]: nextCount }));
    setLearningHours((h) => Number((h + 1.5).toFixed(1)));

    const isFinished = nextCount >= course.lessonsCount;
    const msg = isFinished
      ? `${t.appreciationMessages[1]} (${course.title})`
      : t.appreciationMessages[nextCount % t.appreciationMessages.length];
    showAppreciation(
      msg,
      isFinished ? `Completed: ${course.title}` : `Lesson ${nextCount} Done`
    );
  };

  const handleToggleBookmark = (courseId: string) => {
    setBookmarkedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleToggleBookmarkGuide = (guideId: string) => {
    setBookmarkedGuideIds((prev) =>
      prev.includes(guideId)
        ? prev.filter((id) => id !== guideId)
        : [...prev, guideId]
    );
  };

  const handleDownloadGuide = (guide: StudyGuide) => {
    const today = getIsoDateOffset(0);
    setDownloadedGuides((prev) => ({ ...prev, [guide.id]: today }));
    try {
      const blob = new Blob([guide.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${guide.id}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore download trigger issues in restricted frames
    }
    showAppreciation(
      `Saved "${guide.title}" to your Learning Resources.`,
      "Study Guide Downloaded"
    );
  };

  const handleRemoveDownloadedGuide = (guideId: string) => {
    setDownloadedGuides((prev) => {
      const next = { ...prev };
      delete next[guideId];
      return next;
    });
  };

  const handleSaveOrApplyJob = (jobId: string, status: ApplicationStatus) => {
    recordDailyActivity();
    const today = new Date().toISOString().slice(0, 10);
    setApplications((prev) => {
      const existing = prev.find((a) => a.jobId === jobId);
      if (existing) {
        return prev.map((a) =>
          a.jobId === jobId ? { ...a, status, updatedAt: today } : a
        );
      }
      return [
        {
          jobId,
          status,
          appliedDate: today,
          reminderDate: today,
          notes: "",
          updatedAt: today,
        },
        ...prev,
      ];
    });
    const job = EXAMPLE_JOBS.find((j) => j.id === jobId);
    if (job) {
      showAppreciation(
        `Tracked "${job.title}" as ${status}.`,
        "Career Activity Recorded"
      );
    }
  };

  const handleUpdateApplication = (
    jobId: string,
    patch: Partial<JobApplication>
  ) => {
    setApplications((prev) =>
      prev.map((a) => (a.jobId === jobId ? { ...a, ...patch } : a))
    );
  };

  const handleRemoveApplication = (jobId: string) => {
    setApplications((prev) => prev.filter((a) => a.jobId !== jobId));
  };

  // Sign Language Assistant Task Execution (Bottom-Right Corner Dock)
  const handleExecuteSignTask = (result: SignDetectionResult) => {
    if (result.actionType === "navigate" && result.actionTarget) {
      const validViews: AppView[] = [
        "dashboard",
        "vision",
        "courses",
        "resources",
        "progress",
        "jobs",
        "tracker",
        "linkedin",
        "assistant",
        "settings",
      ];
      if (validViews.includes(result.actionTarget as AppView)) {
        if (!user.signedIn) {
          setUser((u) => ({
            ...u,
            signedIn: true,
            name: u.name || "Learner",
            email: u.email || "learner@accesspath.org",
          }));
        }
        setView(result.actionTarget as AppView);
      }
    } else if (result.actionType === "complete_lesson") {
      const activeCourse = SAVANNAH_DEMO_COURSES.find(
        (c) =>
          enrolledCourseIds.includes(c.id) &&
          (courseProgress[c.id] || 0) < c.lessonsCount
      );
      if (activeCourse) {
        handleCompleteLesson(activeCourse);
      }
    } else if (result.actionType === "read_aloud") {
      triggerVoice(result.replyInLanguage);
    }
    setVoiceStatus((prev) => ({
      ...prev,
      caption: result.replyInLanguage,
    }));
  };

  // Onboarding View
  if (!user.signedIn) {
    return (
      <>
        <OnboardingFlow
          preferences={preferences}
          user={user}
          voiceStatus={voiceStatus}
          onSelectLanguage={handleSelectLanguage}
          onToggleDisability={handleToggleDisability}
          onToggleColorConfusion={handleToggleColorConfusion}
          onToggleTheme={() =>
            updatePreference(
              "theme",
              preferences.theme === "dark" ? "light" : "dark"
            )
          }
          onTriggerVoice={triggerVoice}
          onStopVoice={stopAllVoicePlayback}
          onCompleteOnboarding={({ name, email, careerPlan }) => {
            setUser({
              signedIn: true,
              name,
              email,
              careerPlan,
            });
            setView("dashboard");
            if (preferences.disabilities.includes("blind")) {
              setVoiceNavigatorOpen(true);
              setVoiceAutoStartSignal((s) => s + 1);
            }
            if (
              preferences.disabilities.includes("deaf") ||
              preferences.language !== "en"
            ) {
              setAiCommunicatorOpen(true);
            }
          }}
          onOpenVisualAssistant={() => {
            setUser((u) => ({
              ...u,
              signedIn: true,
              name: u.name || "Learner",
              email: u.email || "learner@accesspath.org",
            }));
            setView("vision");
          }}
        />
        {/* Sign Language Assistant ONLY in bottom-right corner */}
        <SignLanguageDock
          language={preferences.language}
          signLanguageSystem={preferences.signLanguageSystem}
          isOpen={preferences.signDockOpen}
          activeCaption={voiceStatus.caption}
          onToggleOpen={() =>
            updatePreference("signDockOpen", !preferences.signDockOpen)
          }
          onChangeSignSystem={(sys) =>
            updatePreference("signLanguageSystem", sys)
          }
          onExecuteSignTask={handleExecuteSignTask}
        />
      </>
    );
  }

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: "dashboard", label: t.nav.dashboard },
    { id: "vision", label: t.nav.vision },
    { id: "courses", label: t.nav.courses },
    { id: "resources", label: t.nav.resources },
    { id: "progress", label: t.nav.progress },
    { id: "jobs", label: t.nav.jobs },
    { id: "tracker", label: t.nav.tracker },
    { id: "linkedin", label: t.nav.linkedin },
    { id: "assistant", label: t.nav.assistant },
    { id: "settings", label: t.nav.settings },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#0D1117] text-[#1F2328] dark:text-[#E6EDF3] flex flex-col">
      {/* Skip link for screen readers & keyboard users */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0969DA] focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Clean 3-Zone Top Bar Contract */}
      <header className="border-b border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => setView("dashboard")}
            className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            {t.brand}
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-5 text-sm font-medium overflow-x-auto"
          >
            {navItems.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    active
                      ? "border-[#0969DA] dark:border-[#58A6FF] text-[#1F2328] dark:text-[#E6EDF3] font-semibold"
                      : "border-transparent text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#E6EDF3]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <button
            type="button"
            onClick={() => setCareerModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap shrink-0"
          >
            {t.nav.careerPlanAction}
          </button>
        </div>

        {/* Mobile/Tablet Horizontal Nav */}
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[#D0D7DE] dark:border-[#30363D] px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`whitespace-nowrap shrink-0 px-2 py-1 rounded ${
                view === item.id
                  ? "bg-[#0969DA] text-white"
                  : "text-[#656D76] dark:text-[#8B949E]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Persistent Accessibility & Language Workspace Toolbar */}
      <div className="border-b border-[#D0D7DE] dark:border-[#30363D] bg-[#FFFFFF]/80 dark:bg-[#161B22]/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-[#656D76]" aria-hidden="true" />
              <span className="sr-only">Language selector</span>
              <select
                aria-label="Select platform language"
                value={preferences.language}
                onChange={(e) =>
                  handleSelectLanguage(e.target.value as LanguageCode)
                }
                className="px-2 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.englishName})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() =>
                updatePreference(
                  "theme",
                  preferences.theme === "dark" ? "light" : "dark"
                )
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            >
              {preferences.theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setView("vision")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                view === "vision"
                  ? "border-[#0969DA] bg-[#0969DA] text-white font-semibold"
                  : "border-[#0969DA]/60 bg-[#0969DA]/10 text-[#0969DA] dark:text-[#58A6FF] font-semibold"
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.nav.vision}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setVoiceNavigatorOpen(true);
                setVoiceAutoStartSignal((s) => s + 1);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                voiceNavigatorOpen
                  ? "border-[#0969DA] bg-[#0969DA]/10 text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                  : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
              }`}
            >
              <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Voice Navigator</span>
            </button>

            <button
              type="button"
              onClick={() => setAiCommunicatorOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                aiCommunicatorOpen
                  ? "border-[#0969DA] bg-[#0969DA]/10 text-[#0969DA] dark:text-[#58A6FF] font-semibold"
                  : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
              }`}
            >
              <BookOpenText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Language Reader</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerVoice(
                  t.disabilities[preferences.disabilities[0] || "standard"]
                    .instantVoiceInstruction
                )
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Voice Guide</span>
            </button>

            {voiceStatus.playing && (
              <button
                type="button"
                onClick={stopAllVoicePlayback}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149]"
              >
                <Square className="w-3 h-3" aria-hidden="true" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {preferences.captionsEnabled && voiceStatus.caption && (
            <div
              aria-live="polite"
              className="text-xs text-[#656D76] dark:text-[#8B949E] truncate max-w-xl"
            >
              <span className="font-semibold text-[#1F2328] dark:text-[#E6EDF3]">
                Captions:{" "}
              </span>
              {voiceStatus.caption}
            </div>
          )}
        </div>
      </div>

      {/* Hierarchical Two-Way Voice Navigator (General -> Major Options -> Specific Items) */}
      <VoiceNavigatorBar
        enabled={voiceNavigatorOpen}
        autoStartSignal={voiceAutoStartSignal}
        preferences={preferences}
        user={user}
        currentView={view}
        rankedCourses={rankedCourses}
        rankedJobs={rankedJobs}
        enrolledCourseIds={enrolledCourseIds}
        bookmarkedCourseIds={bookmarkedCourseIds}
        courseProgress={courseProgress}
        applications={applications}
        learningHours={learningHours}
        weeklyGoalHours={weeklyGoalHours}
        earnedBadgesCount={Object.keys(earnedBadges).length}
        downloadedGuidesCount={Object.keys(downloadedGuides).length}
        streakDays={streakDays}
        voiceStatus={voiceStatus}
        onNavigate={setView}
        onEnrollCourse={handleEnrollCourse}
        onCompleteLesson={handleCompleteLesson}
        onSaveOrApplyJob={handleSaveOrApplyJob}
        onCheckInToday={handleCheckInToday}
        onTriggerVoice={triggerVoice}
        onStopVoice={stopAllVoicePlayback}
        onToggleEnabled={() => setVoiceNavigatorOpen((v) => !v)}
      />

      {/* Chosen-Language AI Reader & Transcribe Audio Communicator */}
      <MultilingualAICommunicator
        enabled={aiCommunicatorOpen}
        preferences={preferences}
        user={user}
        currentView={view}
        pageSummary={currentPageSummary}
        onUpdateCaption={handleUpdateCaption}
        onSpeakText={handleSpeakText}
        onHide={handleHideAiCommunicator}
      />

      {/* Milestone Appreciation Notification Banner */}
      {appreciationToast && (
        <div
          role="status"
          aria-live="polite"
          className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-4"
        >
          <div className="rounded-md border border-[#1A7F37]/40 bg-[#1A7F37]/10 dark:border-[#3FB950]/40 px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-[#1A7F37] dark:text-[#3FB950]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{appreciationToast}</span>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main
        id="main-workspace"
        className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 pb-24"
      >
        {view === "dashboard" && (
          <DashboardView
            preferences={preferences}
            user={user}
            rankedCourses={rankedCourses}
            rankedJobs={rankedJobs}
            courseProgress={courseProgress}
            enrolledCourseIds={enrolledCourseIds}
            applications={applications}
            milestones={milestones}
            learningHours={learningHours}
            weeklyGoalHours={weeklyGoalHours}
            activityDates={activityDates}
            voiceStatus={voiceStatus}
            onNavigate={setView}
            onCompleteLesson={handleCompleteLesson}
            onEnrollCourse={handleEnrollCourse}
            onSaveJob={(jobId) => handleSaveOrApplyJob(jobId, "Saved")}
            onCheckInToday={handleCheckInToday}
            onTriggerVoice={(txt) => triggerVoice(txt)}
            onUpdatePreference={updatePreference}
            onOpenCareerPlanModal={() => setCareerModalOpen(true)}
          />
        )}

        {view === "courses" && (
          <CoursesView
            language={preferences.language}
            signLanguageSystem={preferences.signLanguageSystem}
            reducedMotion={preferences.reducedMotion}
            user={user}
            rankedCourses={rankedCourses}
            studyGuides={SAVANNAH_STUDY_GUIDES}
            enrolledCourseIds={enrolledCourseIds}
            bookmarkedCourseIds={bookmarkedCourseIds}
            downloadedGuides={downloadedGuides}
            courseProgress={courseProgress}
            onChangeSignSystem={(sys) =>
              updatePreference("signLanguageSystem", sys)
            }
            onToggleBookmark={handleToggleBookmark}
            onEnrollCourse={handleEnrollCourse}
            onCompleteLesson={handleCompleteLesson}
            onDownloadGuide={handleDownloadGuide}
            onSpeakText={(txt) => triggerVoice(txt)}
          />
        )}

        {view === "resources" && (
          <ResourcesView
            courses={SAVANNAH_DEMO_COURSES}
            studyGuides={SAVANNAH_STUDY_GUIDES}
            enrolledCourseIds={enrolledCourseIds}
            bookmarkedCourseIds={bookmarkedCourseIds}
            bookmarkedGuideIds={bookmarkedGuideIds}
            downloadedGuides={downloadedGuides}
            onToggleBookmarkCourse={handleToggleBookmark}
            onToggleBookmarkGuide={handleToggleBookmarkGuide}
            onDownloadGuide={handleDownloadGuide}
            onRemoveDownloadedGuide={handleRemoveDownloadedGuide}
            onOpenCourseInCatalog={(courseId) => {
              handleEnrollCourse(courseId);
              setView("courses");
            }}
            onSpeakText={(txt) => triggerVoice(txt)}
          />
        )}

        {view === "progress" && (
          <ProgressView
            user={user}
            courses={SAVANNAH_DEMO_COURSES}
            enrolledCourseIds={enrolledCourseIds}
            courseProgress={courseProgress}
            applications={applications}
            milestones={milestones}
            learningHours={learningHours}
            weeklyGoalHours={weeklyGoalHours}
            earnedBadges={earnedBadges}
            onUpdateWeeklyGoal={setWeeklyGoalHours}
          />
        )}

        {view === "jobs" && (
          <JobsView
            user={user}
            rankedJobs={rankedJobs}
            applications={applications}
            onSaveOrApplyJob={handleSaveOrApplyJob}
            onSpeakText={(txt) => triggerVoice(txt)}
          />
        )}

        {view === "tracker" && (
          <TrackerView
            jobs={EXAMPLE_JOBS}
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
            onRemoveApplication={handleRemoveApplication}
          />
        )}

        {view === "linkedin" && (
          <LinkedInView
            language={preferences.language}
            user={user}
            completedCourses={completedCourses}
          />
        )}

        {view === "assistant" && (
          <AssistantView
            preferences={preferences}
            user={user}
            courses={SAVANNAH_DEMO_COURSES}
            jobs={EXAMPLE_JOBS}
            onSpeakText={(txt) => triggerVoice(txt)}
          />
        )}

        {view === "vision" && (
          <BlindVisualAssistantView
            preferences={preferences}
            onSelectLanguage={handleSelectLanguage}
            onUpdateSpeechRate={(rate) => updatePreference("speechRate", rate)}
            onCaptionUpdate={handleUpdateCaption}
          />
        )}

        {view === "settings" && (
          <SettingsView
            preferences={preferences}
            onSelectLanguage={handleSelectLanguage}
            onToggleDisability={handleToggleDisability}
            onToggleColorConfusion={handleToggleColorConfusion}
            onUpdatePreference={updatePreference}
            onSpeakText={(txt) => triggerVoice(txt)}
            onResetPreferences={() => setPreferences(DEFAULT_PREFERENCES)}
            onReturnToOnboarding={() =>
              setUser((u) => ({ ...u, signedIn: false }))
            }
          />
        )}
      </main>

      {/* Sign Language Assistant ONLY at Bottom-Right Corner */}
      <SignLanguageDock
        language={preferences.language}
        signLanguageSystem={preferences.signLanguageSystem}
        isOpen={preferences.signDockOpen}
        activeCaption={voiceStatus.caption}
        onToggleOpen={() =>
          updatePreference("signDockOpen", !preferences.signDockOpen)
        }
        onChangeSignSystem={(sys) =>
          updatePreference("signLanguageSystem", sys)
        }
        onExecuteSignTask={handleExecuteSignTask}
      />

      {careerModalOpen && (
        <CareerPlanModal
          careerPlan={user.careerPlan}
          onSave={(newPlan: CareerPlan) => {
            setUser((u) => ({ ...u, careerPlan: newPlan }));
            showAppreciation(
              `Career Plan updated for ${newPlan.targetRole}. Course and job recommendations refreshed.`,
              "Career Plan Updated"
            );
          }}
          onClose={() => setCareerModalOpen(false)}
        />
      )}
    </div>
  );
}
