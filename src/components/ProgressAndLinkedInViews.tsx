import React, { useMemo, useState } from "react";
import {
  Course,
  JobApplication,
  LanguageCode,
  MilestoneNotification,
  UserProfile,
} from "../types";
import { BadgeDefinition, evaluateBadges } from "../data/badges";
import { apiUrl } from "../services/apiConfig";
import {
  Award,
  BookOpen,
  Bookmark,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  GraduationCap,
  Layers,
  Lock,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";

interface ProgressViewProps {
  user: UserProfile;
  courses: Course[];
  enrolledCourseIds: string[];
  courseProgress: Record<string, number>;
  applications: JobApplication[];
  milestones: MilestoneNotification[];
  learningHours: number;
  weeklyGoalHours: number;
  earnedBadges: Record<string, string>;
  onUpdateWeeklyGoal: (hours: number) => void;
}

function renderBadgeIcon(iconKey: BadgeDefinition["iconKey"], unlocked: boolean) {
  const cls = `w-5 h-5 ${
    unlocked
      ? "text-[#1A7F37] dark:text-[#3FB950]"
      : "text-[#656D76] dark:text-[#8B949E]"
  }`;
  switch (iconKey) {
    case "compass":
      return <Compass className={cls} aria-hidden="true" />;
    case "book":
      return <BookOpen className={cls} aria-hidden="true" />;
    case "layers":
      return <Layers className={cls} aria-hidden="true" />;
    case "graduation":
      return <GraduationCap className={cls} aria-hidden="true" />;
    case "sparkles":
      return <Sparkles className={cls} aria-hidden="true" />;
    case "clock":
      return <Clock className={cls} aria-hidden="true" />;
    case "bookmark":
      return <Bookmark className={cls} aria-hidden="true" />;
    case "send":
      return <Send className={cls} aria-hidden="true" />;
    case "calendar":
      return <CalendarCheck className={cls} aria-hidden="true" />;
    case "trophy":
      return <Trophy className={cls} aria-hidden="true" />;
  }
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  user,
  courses,
  enrolledCourseIds,
  courseProgress,
  applications,
  milestones,
  learningHours,
  weeklyGoalHours,
  earnedBadges,
  onUpdateWeeklyGoal,
}) => {
  const [badgeCategory, setBadgeCategory] = useState<"all" | "learning" | "career">("all");
  const [badgeStatus, setBadgeStatus] = useState<"all" | "earned" | "locked">("all");

  const evaluatedBadges = useMemo(
    () =>
      evaluateBadges({
        user,
        courses,
        courseProgress,
        applications,
        learningHours,
        weeklyGoalHours,
        earnedBadges,
      }),
    [
      user,
      courses,
      courseProgress,
      applications,
      learningHours,
      weeklyGoalHours,
      earnedBadges,
    ]
  );

  const earnedCount = evaluatedBadges.filter((b) => b.unlocked).length;

  const visibleBadges = useMemo(() => {
    return evaluatedBadges.filter((item) => {
      if (badgeCategory !== "all" && item.badge.category !== badgeCategory)
        return false;
      if (badgeStatus === "earned" && !item.unlocked) return false;
      if (badgeStatus === "locked" && item.unlocked) return false;
      return true;
    });
  }, [evaluatedBadges, badgeCategory, badgeStatus]);
  const completedCourses = courses.filter(
    (c) => (courseProgress[c.id] || 0) >= c.lessonsCount
  );
  const totalLessons = Object.values(courseProgress).reduce((s, n) => s + n, 0);
  const skillsDeveloped = Array.from(
    new Set(completedCourses.flatMap((c) => c.skills))
  );

  const weeklyActivity = [
    { label: "Mon", hours: 1.5 },
    { label: "Tue", hours: 2.0 },
    { label: "Wed", hours: 1.0 },
    { label: "Thu", hours: 2.5 },
    { label: "Fri", hours: Math.max(1.0, Number((learningHours * 0.25).toFixed(1))) },
    { label: "Sat", hours: 1.5 },
    { label: "Sun", hours: 1.0 },
  ];

  const maxBar = Math.max(...weeklyActivity.map((d) => d.hours), 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Learning Progress &amp; Achievements
        </h1>
        <p className="text-sm text-[#656D76] dark:text-[#8B949E] mt-1">
          Every completed lesson, skill, and career step moves you closer to {user.careerPlan.targetRole}.
        </p>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Courses Started", val: enrolledCourseIds.length },
          { label: "Courses Completed", val: completedCourses.length },
          { label: "Lessons Done", val: totalLessons },
          { label: "Learning Hours", val: `${learningHours}h` },
          { label: "Skills Verified", val: skillsDeveloped.length },
          { label: "Jobs Tracked", val: applications.length },
        ].map((item) => (
          <div
            key={item.label}
            className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4"
          >
            <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
              {item.label}
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums mt-1">
              {item.val}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Accessible Direct-Labeled Bar Chart */}
        <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Weekly Study Summary</h2>
              <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                Direct values displayed on every bar for screen-reader and color-vision clarity
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums">
              Goal: {weeklyGoalHours}h/wk
            </div>
          </div>

          <div className="space-y-2.5" role="list" aria-label="Weekly learning hours">
            {weeklyActivity.map((day) => {
              const widthPct = Math.round((day.hours / maxBar) * 100);
              return (
                <div key={day.label} role="listitem" className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-mono font-medium">{day.label}</span>
                  <div className="flex-1 h-4 rounded bg-[#EAEEF2] dark:bg-[#21262D] overflow-hidden">
                    <div
                      className="h-full bg-[#0969DA] dark:bg-[#58A6FF]"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums font-semibold">
                    {day.hours}h
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] flex items-center justify-between gap-4 text-xs">
            <label htmlFor="weekly-goal-input" className="font-medium">
              Personal weekly target (hours):
            </label>
            <input
              id="weekly-goal-input"
              type="number"
              min={1}
              max={40}
              value={weeklyGoalHours}
              onChange={(e) => onUpdateWeeklyGoal(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 px-2.5 py-1.5 font-mono tabular-nums rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
            />
          </div>
        </section>

        {/* Virtual Achievement Badges Showcase */}
        <section
          aria-labelledby="badges-section-heading"
          className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1A7F37] dark:text-[#3FB950]" aria-hidden="true" />
              <h2 id="badges-section-heading" className="text-base font-semibold">
                Virtual Achievement Badges
              </h2>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-[#1A7F37] dark:text-[#3FB950]">
              {earnedCount} / {evaluatedBadges.length} Earned
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              role="group"
              aria-label="Filter badges by category"
              className="inline-flex rounded-md border border-[#D0D7DE] dark:border-[#30363D] p-0.5 bg-[#F6F8FA] dark:bg-[#0D1117]"
            >
              {(
                [
                  ["all", "All"],
                  ["learning", "Learning"],
                  ["career", "Job Phases"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBadgeCategory(id)}
                  aria-pressed={badgeCategory === id}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    badgeCategory === id
                      ? "bg-[#0969DA] text-white dark:bg-[#58A6FF] dark:text-[#0D1117]"
                      : "text-[#656D76] dark:text-[#8B949E]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Filter badges by completion status"
              className="inline-flex rounded-md border border-[#D0D7DE] dark:border-[#30363D] p-0.5 bg-[#F6F8FA] dark:bg-[#0D1117]"
            >
              {(
                [
                  ["all", "All"],
                  ["earned", "Earned"],
                  ["locked", "In Progress"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setBadgeStatus(id)}
                  aria-pressed={badgeStatus === id}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    badgeStatus === id
                      ? "bg-[#1F2328] text-white dark:bg-[#E6EDF3] dark:text-[#0D1117]"
                      : "text-[#656D76] dark:text-[#8B949E]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {visibleBadges.map(({ badge, unlocked, earnedAt, current, target }) => {
              const pct = Math.min(100, Math.round((current / target) * 100));
              return (
                <article
                  key={badge.id}
                  className={`p-3.5 rounded-md border text-xs flex flex-col justify-between gap-2.5 ${
                    unlocked
                      ? "border-[#1A7F37]/50 bg-[#1A7F37]/5 dark:border-[#3FB950]/50 dark:bg-[#3FB950]/10"
                      : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] shrink-0">
                        {renderBadgeIcon(badge.iconKey, unlocked)}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold leading-snug">
                          {badge.title}
                        </h3>
                        <div className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
                          {badge.category === "learning"
                            ? "Learning Milestone"
                            : "Job Application Phase"}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${
                        unlocked
                          ? "text-[#1A7F37] dark:text-[#3FB950]"
                          : "text-[#656D76] dark:text-[#8B949E]"
                      }`}
                    >
                      {unlocked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Earned</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" aria-hidden="true" />
                          <span>In Progress</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[#656D76] dark:text-[#8B949E] leading-relaxed">
                    {badge.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span>{badge.criteriaLabel}</span>
                      <span>
                        {unlocked && earnedAt
                          ? earnedAt
                          : `${current}/${target}`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#D0D7DE] dark:bg-[#30363D] overflow-hidden">
                      <div
                        className={`h-full ${
                          unlocked
                            ? "bg-[#1A7F37] dark:bg-[#3FB950]"
                            : "bg-[#0969DA] dark:bg-[#58A6FF]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Milestone Timeline */}
      <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-3">
        <h2 className="text-base font-semibold">Milestone Timeline</h2>
        <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
          {milestones.map((m) => (
            <div key={m.id} className="py-2.5 text-xs flex justify-between gap-3">
              <div>
                <span className="font-semibold">{m.title}: </span>
                <span className="text-[#656D76] dark:text-[#8B949E]">{m.message}</span>
              </div>
              <span className="font-mono text-[#656D76] dark:text-[#8B949E] shrink-0">
                {m.timestamp}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

interface LinkedInViewProps {
  language: LanguageCode;
  user: UserProfile;
  completedCourses: Course[];
}

export const LinkedInView: React.FC<LinkedInViewProps> = ({
  language,
  user,
  completedCourses,
}) => {
  const [headline, setHeadline] = useState(
    `${user.careerPlan.targetRole} | ${user.careerPlan.skills.slice(0, 3).join(" · ")} | Building Inclusive Tech`
  );
  const [bio, setBio] = useState(
    `I am ${user.name}, focused on ${user.careerPlan.targetRole} in ${user.careerPlan.targetTrack}. ${user.careerPlan.goalStatement}`
  );
  const [postDraft, setPostDraft] = useState(
    `Excited to share my learning progress toward ${user.careerPlan.targetRole}. Currently building practical experience in ${user.careerPlan.skills.slice(0, 3).join(", ")}.`
  );
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateDraft = async (draftType: "headline" | "bio" | "post") => {
    setLoadingType(draftType);
    try {
      const res = await fetch(apiUrl("/api/linkedin-draft"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftType,
          language,
          userName: user.name,
          careerPlan: user.careerPlan,
          completedCourseTitles: completedCourses.map((c) => c.title),
          skills: user.careerPlan.skills,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: string };
        if (data.content) {
          if (draftType === "headline") setHeadline(data.content);
          if (draftType === "bio") setBio(data.content);
          if (draftType === "post") setPostDraft(data.content);
        }
      }
    } finally {
      setLoadingType(null);
    }
  };

  const copyText = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]">
          Local Profile &amp; Draft Workspace (Does not auto-publish to external LinkedIn)
        </p>
        <h1 className="text-2xl font-bold tracking-tight">LinkedIn Workspace</h1>
        <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
          Draft headlines, biographies, and milestone posts tailored to your Career Plan and copy them when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Profile Preview */}
        <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
          <h2 className="text-base font-semibold">Profile Preview</h2>
          <div className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] space-y-3">
            <div>
              <div className="text-lg font-bold">{user.name}</div>
              <div className="text-sm text-[#656D76] dark:text-[#8B949E] mt-0.5">
                {headline}
              </div>
              <div className="text-xs text-[#656D76] dark:text-[#8B949E] mt-1">
                {user.careerPlan.workStyle} · {user.careerPlan.targetTrack}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
              <div className="text-xs font-semibold mb-1">About</div>
              <p className="text-xs leading-relaxed text-[#1F2328] dark:text-[#E6EDF3]">
                {bio}
              </p>
            </div>

            <div className="pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
              <div className="text-xs font-semibold mb-1">
                Skills &amp; Completed Courses
              </div>
              <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                Skills: {user.careerPlan.skills.join(" · ")}
              </p>
              <p className="text-xs text-[#656D76] dark:text-[#8B949E] mt-1">
                Certificates:{" "}
                {completedCourses.length > 0
                  ? completedCourses.map((c) => c.title).join(" · ")
                  : "Complete a Savannah course to showcase certificates here"}
              </p>
            </div>
          </div>
        </section>

        {/* Generators */}
        <section className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4">
          {/* Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="li-headline" className="text-xs font-semibold">
                Headline Generator
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateDraft("headline")}
                  disabled={loadingType === "headline"}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{loadingType === "headline" ? "Drafting..." : "AI Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyText("headline", headline)}
                  className="inline-flex items-center gap-1 text-xs text-[#656D76]"
                >
                  {copiedField === "headline" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "headline" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            <input
              id="li-headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="li-bio" className="text-xs font-semibold">
                Professional Biography
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateDraft("bio")}
                  disabled={loadingType === "bio"}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{loadingType === "bio" ? "Drafting..." : "AI Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyText("bio", bio)}
                  className="inline-flex items-center gap-1 text-xs text-[#656D76]"
                >
                  {copiedField === "bio" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "bio" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            <textarea
              id="li-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
            />
          </div>

          {/* Post Draft */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="li-post" className="text-xs font-semibold">
                LinkedIn Milestone Post Draft
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => generateDraft("post")}
                  disabled={loadingType === "post"}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{loadingType === "post" ? "Drafting..." : "AI Draft"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyText("post", postDraft)}
                  className="inline-flex items-center gap-1 text-xs text-[#656D76]"
                >
                  {copiedField === "post" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "post" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
            <textarea
              id="li-post"
              rows={4}
              value={postDraft}
              onChange={(e) => setPostDraft(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
