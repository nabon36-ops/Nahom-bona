import { Course, JobApplication, UserProfile } from "../types";

export type BadgeCategory = "learning" | "career";

export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  title: string;
  description: string;
  criteriaLabel: string;
  iconKey:
    | "compass"
    | "book"
    | "layers"
    | "graduation"
    | "sparkles"
    | "clock"
    | "bookmark"
    | "send"
    | "calendar"
    | "trophy";
}

export interface EvaluatedBadge {
  badge: BadgeDefinition;
  unlocked: boolean;
  earnedAt?: string;
  current: number;
  target: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "accessible-explorer",
    category: "learning",
    title: "Accessible Explorer",
    description:
      "Completed multilingual onboarding, accessibility preferences, and Career Plan setup.",
    criteriaLabel: "Complete onboarding & Career Plan",
    iconKey: "compass",
  },
  {
    id: "first-lesson",
    category: "learning",
    title: "First Step",
    description: "Completed your very first Savannah demonstration lesson.",
    criteriaLabel: "1 lesson completed",
    iconKey: "book",
  },
  {
    id: "five-lessons",
    category: "learning",
    title: "Steady Momentum",
    description: "Built consistent study habits by completing 5 lessons.",
    criteriaLabel: "5 lessons completed",
    iconKey: "layers",
  },
  {
    id: "course-finisher",
    category: "learning",
    title: "Course Finisher",
    description: "Completed 100% of a full Savannah demonstration course.",
    criteriaLabel: "1 full course completed",
    iconKey: "graduation",
  },
  {
    id: "multi-skill-builder",
    category: "learning",
    title: "Skill Builder",
    description: "Verified 3 or more career skills through completed coursework.",
    criteriaLabel: "3 verified skills",
    iconKey: "sparkles",
  },
  {
    id: "study-goal-hit",
    category: "learning",
    title: "Weekly Goal Achiever",
    description: "Reached your personal weekly learning hours target.",
    criteriaLabel: "Meet weekly study goal",
    iconKey: "clock",
  },
  {
    id: "career-scout",
    category: "career",
    title: "Career Scout",
    description: "Saved or tracked your first recommended job or internship.",
    criteriaLabel: "1 opportunity saved",
    iconKey: "bookmark",
  },
  {
    id: "first-application",
    category: "career",
    title: "Application Submitted",
    description:
      "Advanced an opportunity to the Applied phase in your Job Tracker.",
    criteriaLabel: "1 role marked Applied",
    iconKey: "send",
  },
  {
    id: "interview-stage",
    category: "career",
    title: "Interview Ready",
    description: "Reached the Interview phase on a tracked job application.",
    criteriaLabel: "1 role in Interview phase",
    iconKey: "calendar",
  },
  {
    id: "offer-milestone",
    category: "career",
    title: "Offer Milestone",
    description: "Reached the Offer phase in your career pipeline.",
    criteriaLabel: "1 role in Offer phase",
    iconKey: "trophy",
  },
];

export function evaluateBadges(params: {
  user: UserProfile;
  courses: Course[];
  courseProgress: Record<string, number>;
  applications: JobApplication[];
  learningHours: number;
  weeklyGoalHours: number;
  earnedBadges: Record<string, string>;
}): EvaluatedBadge[] {
  const {
    user,
    courses,
    courseProgress,
    applications,
    learningHours,
    weeklyGoalHours,
    earnedBadges,
  } = params;

  const totalLessons = Object.values(courseProgress).reduce((s, n) => s + n, 0);
  const completedCourses = courses.filter(
    (c) => (courseProgress[c.id] || 0) >= c.lessonsCount
  );
  const verifiedSkills = Array.from(
    new Set(completedCourses.flatMap((c) => c.skills))
  );

  const appliedCount = applications.filter((a) =>
    ["Applied", "Interview", "Offer"].includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) =>
    ["Interview", "Offer"].includes(a.status)
  ).length;
  const offerCount = applications.filter((a) => a.status === "Offer").length;

  const progressMap: Record<string, { current: number; target: number }> = {
    "accessible-explorer": { current: user.signedIn ? 1 : 0, target: 1 },
    "first-lesson": { current: Math.min(1, totalLessons), target: 1 },
    "five-lessons": { current: Math.min(5, totalLessons), target: 5 },
    "course-finisher": {
      current: Math.min(1, completedCourses.length),
      target: 1,
    },
    "multi-skill-builder": {
      current: Math.min(3, verifiedSkills.length),
      target: 3,
    },
    "study-goal-hit": {
      current: Math.min(weeklyGoalHours, Math.floor(learningHours)),
      target: weeklyGoalHours,
    },
    "career-scout": { current: Math.min(1, applications.length), target: 1 },
    "first-application": { current: Math.min(1, appliedCount), target: 1 },
    "interview-stage": { current: Math.min(1, interviewCount), target: 1 },
    "offer-milestone": { current: Math.min(1, offerCount), target: 1 },
  };

  return BADGE_DEFINITIONS.map((badge) => {
    const stats = progressMap[badge.id] || { current: 0, target: 1 };
    const criteriaMet = stats.current >= stats.target;
    const earnedAt = earnedBadges[badge.id];
    const unlocked = criteriaMet || Boolean(earnedAt);

    return {
      badge,
      unlocked,
      earnedAt,
      current: unlocked ? stats.target : stats.current,
      target: stats.target,
    };
  });
}
