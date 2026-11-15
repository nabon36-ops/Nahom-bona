import React, { useMemo, useState } from "react";
import {
  AccessibilityPreferences,
  AppView,
  Course,
  JobApplication,
  MilestoneNotification,
  UserProfile,
} from "../types";
import { TRANSLATIONS } from "../i18n/translations";
import {
  RankedCourse,
  RankedJob,
  computeSkillGaps,
} from "../data/catalog";
import {
  finishCurrentListeningNow,
  listenForUserSpeech,
} from "../services/voiceService";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Compass,
  Award,
  Flame,
  Volume2,
  Send,
  Sparkles,
  SlidersHorizontal,
  Mic,
  MicOff,
} from "lucide-react";

interface DashboardViewProps {
  preferences: AccessibilityPreferences;
  user: UserProfile;
  rankedCourses: RankedCourse[];
  rankedJobs: RankedJob[];
  courseProgress: Record<string, number>;
  enrolledCourseIds: string[];
  applications: JobApplication[];
  milestones: MilestoneNotification[];
  learningHours: number;
  weeklyGoalHours: number;
  activityDates: string[];
  voiceStatus: { playing: boolean; provider?: string; caption: string };
  onNavigate: (view: AppView) => void;
  onCompleteLesson: (course: Course) => void;
  onEnrollCourse: (courseId: string) => void;
  onSaveJob: (jobId: string) => void;
  onCheckInToday: () => void;
  onTriggerVoice: (text: string) => void;
  onUpdatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    val: AccessibilityPreferences[K]
  ) => void;
  onOpenCareerPlanModal: () => void;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  preferences,
  user,
  rankedCourses,
  rankedJobs,
  courseProgress,
  enrolledCourseIds,
  applications,
  milestones,
  learningHours,
  weeklyGoalHours,
  activityDates,
  voiceStatus,
  onNavigate,
  onCompleteLesson,
  onEnrollCourse,
  onSaveJob,
  onCheckInToday,
  onTriggerVoice,
  onUpdatePreference,
  onOpenCareerPlanModal,
}) => {
  const t = TRANSLATIONS[preferences.language];
  const [quickPrompt, setQuickPrompt] = useState("");
  const [quickReply, setQuickReply] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickMicState, setQuickMicState] = useState<
    "idle" | "listening" | "transcribing"
  >("idle");

  const streakStats = useMemo(() => {
    const dateSet = new Set(activityDates);
    const today = new Date();
    const todayStr = toIsoDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toIsoDate(yesterday);

    const checkedInToday = dateSet.has(todayStr);

    // Current consecutive streak ending today or yesterday
    let currentStreak = 0;
    const cursor = new Date(checkedInToday ? today : yesterday);
    if (checkedInToday || dateSet.has(yesterdayStr)) {
      while (dateSet.has(toIsoDate(cursor))) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    // Best streak across recorded dates
    const sorted = Array.from(dateSet).sort();
    let bestStreak = currentStreak;
    let run = 0;
    let prevDate: Date | null = null;
    for (const iso of sorted) {
      const dt = new Date(`${iso}T00:00:00`);
      if (prevDate) {
        const diffDays = Math.round(
          (dt.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      if (run > bestStreak) bestStreak = run;
      prevDate = dt;
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const iso = toIsoDate(d);
      return {
        iso,
        dayLabel: d.toLocaleDateString(undefined, { weekday: "short" }),
        active: dateSet.has(iso),
        isToday: iso === todayStr,
      };
    });

    return { currentStreak, bestStreak, checkedInToday, last7Days };
  }, [activityDates]);

  const activeCourses = rankedCourses.filter((rc) =>
    enrolledCourseIds.includes(rc.course.id)
  );
  const completedCourses = activeCourses
    .filter((rc) => (courseProgress[rc.course.id] || 0) >= rc.course.lessonsCount)
    .map((rc) => rc.course);

  const { acquired, gaps } = computeSkillGaps(user.careerPlan, completedCourses);

  const totalLessonsCompleted = Object.values(courseProgress).reduce(
    (sum, n) => sum + n,
    0
  );

  const sendQuickMessage = async (msgText: string) => {
    if (!msgText.trim() || quickLoading) return;
    setQuickLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText.trim(),
          language: preferences.language,
          disabilityProfiles: preferences.disabilities,
          careerPlan: user.careerPlan,
          courses: rankedCourses.map((r) => ({
            id: r.course.id,
            title: r.course.title,
            field: r.course.field,
            skills: r.course.skills,
          })),
          jobs: rankedJobs.map((r) => ({
            id: r.job.id,
            title: r.job.title,
            company: r.job.company,
            track: r.job.track,
          })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        setQuickReply(data.reply || "");
      }
    } finally {
      setQuickLoading(false);
    }
  };

  const handleQuickAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuickMessage(quickPrompt);
  };

  const handleQuickTranscribe = async () => {
    if (quickMicState === "listening") {
      finishCurrentListeningNow();
      return;
    }
    const res = await listenForUserSpeech({
      language: preferences.language,
      maxDurationMs: 7500,
      translateToChosenLanguage: true,
      onStateChange: setQuickMicState,
    });
    const text = (res.localizedTranscript || res.transcript || "").trim();
    if (text) {
      setQuickPrompt(text);
      await sendQuickMessage(text);
    }
  };

  return (
    <div className="space-y-6">
      {/* Career Plan Context Banner */}
      <section
        aria-label="Active Career Plan Summary"
        className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
            {user.name} · {user.careerPlan.experienceLevel} · {user.careerPlan.workStyle}
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            {user.careerPlan.targetRole || user.careerPlan.targetTrack}
          </h1>
          <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
            {user.careerPlan.goalStatement ||
              `Recommendations personalized for ${user.careerPlan.targetTrack}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onTriggerVoice(
                `Hello ${user.name}. Your Career Plan targets ${user.careerPlan.targetRole}. You have ${activeCourses.length} active courses and ${rankedJobs.length} recommended opportunities.`
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] hover:bg-[#EAEEF2] dark:hover:bg-[#30363D] whitespace-nowrap"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Read Summary</span>
          </button>
          <button
            type="button"
            onClick={onOpenCareerPlanModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap"
          >
            <span>Edit Career Plan</span>
          </button>
        </div>
      </section>

      {/* 3-Column Desktop Dashboard: 25% Left / 50% Center / 25% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-5 items-start">
        {/* LEFT COLUMN (25%) */}
        <aside className="space-y-5 min-w-0" aria-label="Recommendations">
          {/* Recommended Savannah Courses */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{t.dashboard.leftCourses}</h2>
              <button
                type="button"
                onClick={() => onNavigate("courses")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline whitespace-nowrap"
              >
                All
              </button>
            </div>
            <p className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
              {t.dashboard.demoCourseBadge} · {t.dashboard.matchReason}
            </p>
            <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
              {rankedCourses.slice(0, 3).map(({ course, matchScore, matchReasons }) => {
                const enrolled = enrolledCourseIds.includes(course.id);
                return (
                  <div key={course.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-snug">
                        {course.title}
                      </h3>
                      <span className="text-[11px] font-mono tabular-nums font-semibold text-[#1A7F37] dark:text-[#3FB950] shrink-0">
                        {matchScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                      {course.difficulty} · {course.durationHours}h · {matchReasons[0]}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        enrolled
                          ? onNavigate("courses")
                          : onEnrollCourse(course.id)
                      }
                      className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
                    >
                      {enrolled ? "Continue in Catalogue" : "Start Course"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Career & Skill Recommendations */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3">
            <h2 className="text-sm font-semibold">{t.dashboard.leftSkills}</h2>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-[11px] font-medium text-[#656D76] dark:text-[#8B949E]">
                  Priority Skill Gaps for {user.careerPlan.targetRole}
                </div>
                <p className="mt-1 font-medium">
                  {gaps.length > 0
                    ? gaps.join(" · ")
                    : "All selected target skills covered"}
                </p>
              </div>
              <div>
                <div className="text-[11px] font-medium text-[#656D76] dark:text-[#8B949E]">
                  Verified Completed Skills
                </div>
                <p className="mt-1 text-[#1A7F37] dark:text-[#3FB950] font-medium">
                  {acquired.length > 0
                    ? acquired.join(" · ")
                    : "Complete a course to verify skills"}
                </p>
              </div>
            </div>
          </section>

          {/* Recommended Jobs & Internships */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">{t.dashboard.leftJobs}</h2>
              <button
                type="button"
                onClick={() => onNavigate("jobs")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline whitespace-nowrap"
              >
                All
              </button>
            </div>
            <p className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
              {t.dashboard.demoJobBadge}
            </p>
            <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
              {rankedJobs.slice(0, 3).map(({ job, matchScore, matchReasons }) => {
                const isSaved = applications.some((a) => a.jobId === job.id);
                return (
                  <div key={job.id} className="py-3 first:pt-1 last:pb-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-snug">
                        {job.title}
                      </h3>
                      <span className="text-[11px] font-mono tabular-nums font-semibold text-[#0969DA] dark:text-[#58A6FF] shrink-0">
                        {matchScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                      {job.company} · {job.workMode} · {matchReasons[0]}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        isSaved ? onNavigate("tracker") : onSaveJob(job.id)
                      }
                      className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
                    >
                      {isSaved ? "Tracked in Pipeline" : "Save Opportunity"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Learning Paths */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">{t.dashboard.leftPaths}</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>1. {user.careerPlan.targetTrack}</span>
                <Compass className="w-3.5 h-3.5 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between text-[#656D76] dark:text-[#8B949E]">
                <span>2. Inclusive Portfolio & LinkedIn</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </div>
          </section>
        </aside>

        {/* CENTER COLUMN (50%) */}
        <section className="space-y-5 min-w-0" aria-label="Active Learning and Tracking">
          {/* Active Courses */}
          <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
                <h2 className="text-base font-semibold">
                  {t.dashboard.centerActiveCourses}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("courses")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline whitespace-nowrap"
              >
                {t.dashboard.openCatalog}
              </button>
            </div>

            {activeCourses.length === 0 ? (
              <div className="py-6 text-center space-y-2 border border-dashed border-[#D0D7DE] dark:border-[#30363D] rounded-md">
                <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
                  No active courses yet. Start a recommended Savannah course.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("courses")}
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] text-white"
                >
                  {t.dashboard.openCatalog}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCourses.map(({ course }) => {
                  const done = courseProgress[course.id] || 0;
                  const pct = Math.round((done / course.lessonsCount) * 100);
                  const finished = done >= course.lessonsCount;
                  return (
                    <div
                      key={course.id}
                      className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold">{course.title}</h3>
                          <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                            {course.field} · {done}/{course.lessonsCount} lessons
                          </p>
                        </div>
                        <span className="text-sm font-mono tabular-nums font-semibold">
                          {pct}%
                        </span>
                      </div>

                      <div
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${course.title} progress`}
                        className="w-full h-2 rounded-full bg-[#D0D7DE] dark:bg-[#30363D] overflow-hidden"
                      >
                        <div
                          className="h-full bg-[#0969DA] dark:bg-[#58A6FF] transition-all duration-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#656D76] dark:text-[#8B949E]">
                          {finished ? (
                            <span className="inline-flex items-center gap-1 text-[#1A7F37] dark:text-[#3FB950] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Course Completed
                            </span>
                          ) : (
                            `Skills: ${course.skills.slice(0, 2).join(", ")}`
                          )}
                        </span>
                        {!finished && (
                          <button
                            type="button"
                            onClick={() => onCompleteLesson(course)}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap"
                          >
                            {t.dashboard.completeLesson}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Learning Streak Tracker */}
          <div
            aria-labelledby="daily-streak-heading"
            className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Flame
                  className="w-5 h-5 text-[#D97706] dark:text-[#F0883E] shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h2 id="daily-streak-heading" className="text-base font-semibold">
                    Daily Learning Streak
                  </h2>
                  <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                    Consistent daily steps build career readiness · Rest days are always welcome
                  </p>
                </div>
              </div>

              {streakStats.checkedInToday ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#1A7F37]/40 text-[#1A7F37] dark:text-[#3FB950] bg-[#1A7F37]/10 whitespace-nowrap shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Active Today</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onCheckInToday}
                  className="px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043] whitespace-nowrap shrink-0"
                >
                  Check In Today
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Current Streak
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-0.5">
                  {streakStats.currentStreak}{" "}
                  {streakStats.currentStreak === 1 ? "day" : "days"}
                </div>
              </div>
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Best Streak
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-0.5">
                  {streakStats.bestStreak}{" "}
                  {streakStats.bestStreak === 1 ? "day" : "days"}
                </div>
              </div>
            </div>

            <div
              role="list"
              aria-label="Last 7 days learning activity"
              className="grid grid-cols-7 gap-2"
            >
              {streakStats.last7Days.map((day) => (
                <div
                  key={day.iso}
                  role="listitem"
                  className={`p-2 rounded-md border text-center space-y-1 ${
                    day.active
                      ? "border-[#1A7F37]/50 bg-[#1A7F37]/10 dark:border-[#3FB950]/50"
                      : day.isToday
                      ? "border-[#0969DA] bg-[#0969DA]/5"
                      : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  }`}
                >
                  <div className="text-[11px] font-medium">
                    {day.isToday ? "Today" : day.dayLabel}
                  </div>
                  <div className="flex justify-center">
                    {day.active ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[#1A7F37] dark:text-[#3FB950]"
                        aria-hidden="true"
                      />
                    ) : (
                      <CircleDashed
                        className="w-4 h-4 text-[#656D76] dark:text-[#8B949E]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-[#656D76] dark:text-[#8B949E]">
                    {day.active ? "Done" : "Rest"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Progress & Metrics Grid */}
          <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">
                {t.dashboard.centerProgress}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate("progress")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
              >
                Detailed Progress
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Active Courses
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">
                  {activeCourses.length}
                </div>
              </div>
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Lessons Done
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">
                  {totalLessonsCompleted}
                </div>
              </div>
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Learning Hours
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">
                  {learningHours}h
                </div>
              </div>
              <div className="p-3 rounded-md border border-[#D0D7DE] dark:border-[#30363D]">
                <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                  Applications
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">
                  {applications.length}
                </div>
              </div>
            </div>

            {/* Daily Learning Hours Goal Visual Progress Bar */}
            {(() => {
              const dailyGoalHours = Math.max(0.1, Number((weeklyGoalHours / 7).toFixed(1)));
              const dailyPaceHours = Number((learningHours / 7).toFixed(1));
              const goalPct = Math.min(
                100,
                Math.round((learningHours / Math.max(0.5, weeklyGoalHours)) * 100)
              );
              const goalMet = goalPct >= 100;

              return (
                <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold">
                      Daily Learning Hours Goal
                    </span>
                    <span className="font-mono tabular-nums font-semibold">
                      {dailyPaceHours}h / {dailyGoalHours}h daily target ·{" "}
                      <span
                        className={
                          goalMet
                            ? "text-[#1A7F37] dark:text-[#3FB950]"
                            : "text-[#0969DA] dark:text-[#58A6FF]"
                        }
                      >
                        {goalPct}%
                      </span>
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={goalPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Daily learning hours goal progress"
                    className="w-full h-2.5 rounded-full bg-[#D0D7DE] dark:bg-[#30363D] overflow-hidden"
                  >
                    <div
                      className={`h-full transition-all duration-200 ${
                        goalMet
                          ? "bg-[#1A7F37] dark:bg-[#3FB950]"
                          : "bg-[#0969DA] dark:bg-[#58A6FF]"
                      }`}
                      style={{ width: `${goalPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#656D76] dark:text-[#8B949E]">
                    <span>
                      {goalMet
                        ? "Goal reached! Great consistency across your weekly target."
                        : `${Number(Math.max(0, weeklyGoalHours - learningHours).toFixed(1))}h remaining toward your ${weeklyGoalHours}h/week pace`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate("progress")}
                      className="font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline whitespace-nowrap"
                    >
                      Adjust Goal
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Completed Learning Milestones & Personal Achievements */}
          <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1A7F37] dark:text-[#3FB950]" aria-hidden="true" />
              <h2 className="text-base font-semibold">
                {t.dashboard.centerMilestones} & {t.dashboard.centerAchievements}
              </h2>
            </div>
            <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
              {milestones.slice(0, 4).map((m) => (
                <div key={m.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold">{m.title}</div>
                    <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {m.message}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#656D76] dark:text-[#8B949E] shrink-0">
                    {m.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Job Application Tracker Snapshot & Career Updates */}
          <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
                <h2 className="text-base font-semibold">
                  {t.dashboard.centerTracker}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("tracker")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
              >
                Open Tracker
              </button>
            </div>
            {applications.length === 0 ? (
              <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                Save or apply to a recommended role to track interviews and reminders.
              </p>
            ) : (
              <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
                {applications.slice(0, 3).map((app) => {
                  const job = rankedJobs.find((r) => r.job.id === app.jobId)?.job;
                  if (!job) return null;
                  return (
                    <div
                      key={app.jobId}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{job.title}</div>
                        <div className="text-[#656D76] dark:text-[#8B949E] truncate">
                          {job.company} · Applied {app.appliedDate}
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-[#0969DA] dark:text-[#58A6FF] shrink-0">
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN (25%) — STRICTLY NO SIGN LANGUAGE ASSISTANT HERE (only bottom-right dock) */}
        <aside className="space-y-5 min-w-0" aria-label="AI Assistant and Accessibility Tools">
          {/* AI Career Assistant Quick Widget */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
                <h2 className="text-sm font-semibold">{t.dashboard.rightAssistant}</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("assistant")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
              >
                Full Chat
              </button>
            </div>
            <form onSubmit={handleQuickAsk} className="space-y-2">
              <label htmlFor="quick-ai-input" className="sr-only">
                Ask AI Career Assistant
              </label>
              <div className="flex gap-1.5">
                <input
                  id="quick-ai-input"
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Ask or transcribe audio..."
                  className="flex-1 min-w-0 px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                />
                <button
                  type="button"
                  onClick={handleQuickTranscribe}
                  disabled={quickLoading || quickMicState === "transcribing"}
                  aria-label="Transcribe microphone audio"
                  className={`px-2.5 py-2 rounded-md border shrink-0 ${
                    quickMicState === "listening"
                      ? "border-[#1A7F37] bg-[#1A7F37] text-white"
                      : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
                  }`}
                >
                  {quickMicState === "listening" ? (
                    <MicOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={quickLoading}
                  aria-label="Send message to AI Assistant"
                  className="px-3 py-2 rounded-md bg-[#0969DA] text-white hover:bg-[#0550AE] disabled:opacity-60 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
            {quickReply && (
              <div className="p-2.5 rounded-md bg-[#F6F8FA] dark:bg-[#0D1117] border border-[#D0D7DE] dark:border-[#30363D] text-xs leading-relaxed">
                {quickReply}
              </div>
            )}
          </section>

          {/* Accessibility Tools */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                <h2 className="text-sm font-semibold">{t.dashboard.rightTools}</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("settings")}
                className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF] hover:underline"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span>Text Size ({Math.round(preferences.textScale * 100)}%)</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePreference(
                        "textScale",
                        Math.max(0.9, Number((preferences.textScale - 0.1).toFixed(2)))
                      )
                    }
                    aria-label="Decrease text size"
                    className="px-2 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D]"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePreference(
                        "textScale",
                        Math.min(1.35, Number((preferences.textScale + 0.1).toFixed(2)))
                      )
                    }
                    aria-label="Increase text size"
                    className="px-2 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D]"
                  >
                    A+
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span>High Contrast</span>
                <input
                  type="checkbox"
                  checked={preferences.highContrast}
                  onChange={(e) =>
                    onUpdatePreference("highContrast", e.target.checked)
                  }
                />
              </label>

              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span>Reduced Motion</span>
                <input
                  type="checkbox"
                  checked={preferences.reducedMotion}
                  onChange={(e) =>
                    onUpdatePreference("reducedMotion", e.target.checked)
                  }
                />
              </label>

              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span>Live Captions</span>
                <input
                  type="checkbox"
                  checked={preferences.captionsEnabled}
                  onChange={(e) =>
                    onUpdatePreference("captionsEnabled", e.target.checked)
                  }
                />
              </label>
            </div>
          </section>

          {/* Instructor Audio & Captions (without duplicate sign-language dock) */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-2.5">
            <h2 className="text-sm font-semibold">{t.dashboard.rightCaptions}</h2>
            <p className="text-xs text-[#656D76] dark:text-[#8B949E] leading-relaxed">
              {voiceStatus.caption ||
                "Ethiopian language voice guidance and captions synchronize automatically."}
            </p>
            <button
              type="button"
              onClick={() =>
                onTriggerVoice(
                  voiceStatus.caption ||
                    t.disabilities[preferences.disabilities[0] || "standard"]
                      .instantVoiceInstruction
                )
              }
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D]"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Speak Current Guidance</span>
            </button>
          </section>

          {/* Progress Appreciation & Motivational Messages */}
          <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-2">
            <h2 className="text-sm font-semibold">
              {t.dashboard.rightAppreciation}
            </h2>
            <p className="text-xs leading-relaxed text-[#1A7F37] dark:text-[#3FB950] font-medium">
              {t.appreciationMessages[totalLessonsCompleted % t.appreciationMessages.length]}
            </p>
            <p className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
              Learn at your own pace. Every step forward builds durable skills.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};
