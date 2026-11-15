import { CareerPlan, Course, JobOpportunity, StudyGuide } from "../types";

export const CAREER_TRACKS = [
  "Full-Stack Web & Accessibility",
  "Data Analytics & AI",
  "Cloud & Cybersecurity",
  "UI/UX & Inclusive Design",
  "Digital Marketing & Product",
  "Mobile Engineering",
];

export const TARGET_SKILLS_POOL = [
  "TypeScript",
  "React",
  "WCAG Accessibility",
  "Python",
  "SQL & Data Modeling",
  "Cloud Fundamentals",
  "UI/UX Research",
  "Technical Communication",
  "API Design",
  "Digital Strategy",
];

export const SAVANNAH_DEMO_COURSES: Course[] = [
  {
    id: "sav-web-101",
    title: "Accessible TypeScript & React Engineering",
    provider: "Savannah Demonstration Catalogue",
    field: "Full-Stack Web & Accessibility",
    difficulty: "Beginner",
    durationHours: 14,
    lessonsCount: 8,
    skills: ["TypeScript", "React", "WCAG Accessibility", "Technical Communication"],
    description:
      "Build keyboard-navigable, screen-reader-friendly React interfaces using semantic HTML and strict TypeScript.",
    isNew: true,
    trackTags: ["Full-Stack Web & Accessibility", "UI/UX & Inclusive Design"],
  },
  {
    id: "sav-data-201",
    title: "Applied Python & SQL for Inclusive Analytics",
    provider: "Savannah Demonstration Catalogue",
    field: "Data Analytics & AI",
    difficulty: "Intermediate",
    durationHours: 18,
    lessonsCount: 10,
    skills: ["Python", "SQL & Data Modeling", "Technical Communication"],
    description:
      "Transform raw organizational datasets into accessible charts, automated reports, and reliable forecasts.",
    isUpdated: true,
    trackTags: ["Data Analytics & AI"],
  },
  {
    id: "sav-ux-105",
    title: "Inclusive Design Systems & Color-Safe UI",
    provider: "Savannah Demonstration Catalogue",
    field: "UI/UX & Inclusive Design",
    difficulty: "Beginner",
    durationHours: 10,
    lessonsCount: 6,
    skills: ["UI/UX Research", "WCAG Accessibility", "Digital Strategy"],
    description:
      "Design clear digital products that never rely on color alone, support assistive tech, and scale across languages.",
    isNew: true,
    trackTags: ["UI/UX & Inclusive Design", "Full-Stack Web & Accessibility"],
  },
  {
    id: "sav-cloud-210",
    title: "Cloud Architecture & API Security Foundations",
    provider: "Savannah Demonstration Catalogue",
    field: "Cloud & Cybersecurity",
    difficulty: "Intermediate",
    durationHours: 16,
    lessonsCount: 9,
    skills: ["Cloud Fundamentals", "API Design", "TypeScript"],
    description:
      "Deploy resilient server-side APIs, manage secrets safely, and audit authentication workflows.",
    trackTags: ["Cloud & Cybersecurity", "Full-Stack Web & Accessibility"],
  },
  {
    id: "sav-prod-120",
    title: "Product Discovery & Accessible Growth Strategy",
    provider: "Savannah Demonstration Catalogue",
    field: "Digital Marketing & Product",
    difficulty: "Beginner",
    durationHours: 9,
    lessonsCount: 5,
    skills: ["Digital Strategy", "Technical Communication", "UI/UX Research"],
    description:
      "Measure user retention, craft clear multilingual product messaging, and ship inclusive product launches.",
    trackTags: ["Digital Marketing & Product"],
  },
  {
    id: "sav-mob-240",
    title: "Cross-Platform Mobile & Voice-First Interfaces",
    provider: "Savannah Demonstration Catalogue",
    field: "Mobile Engineering",
    difficulty: "Advanced",
    durationHours: 20,
    lessonsCount: 12,
    skills: ["React", "TypeScript", "API Design", "WCAG Accessibility"],
    description:
      "Create responsive mobile web applications with voice guidance, offline resilience, and gesture-friendly targets.",
    isUpdated: true,
    trackTags: ["Mobile Engineering", "Full-Stack Web & Accessibility"],
  },
];

export const EXAMPLE_JOBS: JobOpportunity[] = [
  {
    id: "job-01",
    title: "Junior Frontend & Accessibility Engineer",
    company: "HornTech Digital (Example)",
    location: "Addis Ababa / Remote",
    opportunityType: "Entry-Level",
    workMode: "Remote",
    track: "Full-Stack Web & Accessibility",
    skillsRequired: ["React", "TypeScript", "WCAG Accessibility"],
    summary:
      "Build responsive web dashboards with keyboard-first navigation and multilingual Ethiopic typography support.",
    accessibilityHighlights: [
      "Flexible async communication",
      "Caption-ready team standups",
      "Screen-reader tested tooling",
    ],
    postedLabel: "Example listing · Updated this week",
  },
  {
    id: "job-02",
    title: "Data & Impact Analytics Intern",
    company: "Savannah Civic Lab (Example)",
    location: "Remote Across East Africa",
    opportunityType: "Internship",
    workMode: "Remote",
    track: "Data Analytics & AI",
    skillsRequired: ["Python", "SQL & Data Modeling", "Technical Communication"],
    summary:
      "Support public education analytics pipelines and produce accessible weekly summary briefs.",
    accessibilityHighlights: [
      "Paid mentorship stipend",
      "Written-first project specs",
    ],
    postedLabel: "Example listing · Entry friendly",
  },
  {
    id: "job-03",
    title: "Inclusive Product Designer",
    company: "Kaffa Works Studio (Example)",
    location: "Addis Ababa (Hybrid)",
    opportunityType: "Full-time",
    workMode: "Hybrid",
    track: "UI/UX & Inclusive Design",
    skillsRequired: ["UI/UX Research", "WCAG Accessibility", "Digital Strategy"],
    summary:
      "Lead accessibility audits, color-vision safe component tokens, and multilingual onboarding flows.",
    accessibilityHighlights: [
      "Ergonomic workstation support",
      "Interpreter budget available",
    ],
    postedLabel: "Example listing · Active",
  },
  {
    id: "job-04",
    title: "Associate Cloud & API Developer",
    company: "NileCloud Systems (Example)",
    location: "Remote",
    opportunityType: "Entry-Level",
    workMode: "Remote",
    track: "Cloud & Cybersecurity",
    skillsRequired: ["Cloud Fundamentals", "API Design", "TypeScript"],
    summary:
      "Maintain backend Node.js services, write automated API tests, and document deployment workflows.",
    accessibilityHighlights: [
      "Async code reviews",
      "Documented onboarding playbooks",
    ],
    postedLabel: "Example listing · Remote",
  },
  {
    id: "job-05",
    title: "Digital Growth & Localization Fellow",
    company: "EthioConnect Hub (Example)",
    location: "Addis Ababa / Remote",
    opportunityType: "Internship",
    workMode: "Remote",
    track: "Digital Marketing & Product",
    skillsRequired: ["Digital Strategy", "Technical Communication", "UI/UX Research"],
    summary:
      "Coordinate Amharic, Afaan Oromo, Somali, and Tigrinya outreach campaigns for inclusive learning programs.",
    accessibilityHighlights: [
      "Multilingual team environment",
      "Sign-language friendly workshops",
    ],
    postedLabel: "Example listing · Fellowship",
  },
  {
    id: "job-06",
    title: "Mobile Web Interface Developer",
    company: "Selam Mobility Tech (Example)",
    location: "Remote",
    opportunityType: "Full-time",
    workMode: "Remote",
    track: "Mobile Engineering",
    skillsRequired: ["React", "TypeScript", "API Design"],
    summary:
      "Build lightweight mobile web experiences tuned for low-bandwidth regions and assistive technologies.",
    accessibilityHighlights: [
      "Flexible core hours",
      "Full assistive hardware allowance",
    ],
    postedLabel: "Example listing · Remote",
  },
];

export interface RankedCourse {
  course: Course;
  matchScore: number;
  matchReasons: string[];
}

export interface RankedJob {
  job: JobOpportunity;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
}

export function rankCoursesByCareerPlan(
  courses: Course[],
  plan: CareerPlan
): RankedCourse[] {
  return courses
    .map((course) => {
      let score = 30;
      const reasons: string[] = [];

      if (
        course.field === plan.targetTrack ||
        course.trackTags.includes(plan.targetTrack)
      ) {
        score += 40;
        reasons.push(`Track: ${plan.targetTrack}`);
      }

      const matchingSkills = course.skills.filter((s) =>
        plan.skills.includes(s)
      );
      if (matchingSkills.length > 0) {
        score += Math.min(25, matchingSkills.length * 10);
        reasons.push(`Skills: ${matchingSkills.slice(0, 2).join(", ")}`);
      }

      if (
        (plan.experienceLevel === "Beginner" ||
          plan.experienceLevel === "Career Switcher") &&
        course.difficulty === "Beginner"
      ) {
        score += 10;
        reasons.push("Level fit");
      } else if (
        plan.experienceLevel === "Entry-Level" &&
        course.difficulty !== "Advanced"
      ) {
        score += 8;
        reasons.push("Entry-ready");
      } else if (
        plan.experienceLevel === "Intermediate" &&
        course.difficulty === "Intermediate"
      ) {
        score += 10;
        reasons.push("Intermediate depth");
      }

      return {
        course,
        matchScore: Math.min(99, score),
        matchReasons: reasons.length > 0 ? reasons : ["Core foundational skill"],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function rankJobsByCareerPlan(
  jobs: JobOpportunity[],
  plan: CareerPlan,
  completedSkills: string[]
): RankedJob[] {
  const userSkillSet = new Set([...plan.skills, ...completedSkills]);

  return jobs
    .map((job) => {
      let score = 25;
      const reasons: string[] = [];

      if (job.track === plan.targetTrack) {
        score += 35;
        reasons.push(`Matches ${plan.targetTrack}`);
      }

      if (
        job.workMode === plan.workStyle ||
        (plan.workStyle === "Internship" && job.opportunityType === "Internship")
      ) {
        score += 15;
        reasons.push(`${plan.workStyle} preference`);
      }

      const matchedSkills = job.skillsRequired.filter((s) => userSkillSet.has(s));
      const missingSkills = job.skillsRequired.filter((s) => !userSkillSet.has(s));

      score += matchedSkills.length * 12;
      if (matchedSkills.length > 0) {
        reasons.push(`${matchedSkills.length}/${job.skillsRequired.length} target skills`);
      }

      if (
        plan.targetRole &&
        job.title.toLowerCase().includes(plan.targetRole.toLowerCase().split(" ")[0] || "")
      ) {
        score += 8;
      }

      return {
        job,
        matchScore: Math.min(98, score),
        matchedSkills,
        missingSkills,
        matchReasons: reasons.length > 0 ? reasons : ["Transferable opportunity"],
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function computeSkillGaps(
  plan: CareerPlan,
  completedCourses: Course[]
): { acquired: string[]; gaps: string[] } {
  const acquiredSet = new Set<string>();
  completedCourses.forEach((c) => c.skills.forEach((s) => acquiredSet.add(s)));

  const acquired = plan.skills.filter((s) => acquiredSet.has(s));
  const gaps = plan.skills.filter((s) => !acquiredSet.has(s));

  return { acquired, gaps };
}

export const SAVANNAH_STUDY_GUIDES: StudyGuide[] = [
  {
    id: "guide-wcag-checklist",
    courseId: "sav-web-101",
    title: "WCAG & Keyboard-First React Study Guide",
    field: "Full-Stack Web & Accessibility",
    format: "Markdown (.md)",
    sizeLabel: "18 KB",
    summary:
      "Concise reference for semantic landmarks, focus-visible indicators, ARIA live regions, and TypeScript accessible component patterns.",
    content: `# WCAG & Keyboard-First React Study Guide (Savannah Demonstration)

1. Use native <button>, <a href>, and <select> elements before custom ARIA widgets.
2. Provide visible focus rings on every interactive control (focus-visible).
3. Never communicate status by color alone—pair color with explicit icons and labels.
4. Use aria-live="polite" for milestone notifications and synchronized captions.
5. Keep target sizes at least 40x40px for motor accessibility.`,
  },
  {
    id: "guide-python-sql",
    courseId: "sav-data-201",
    title: "Python & SQL Accessible Analytics Workbook",
    field: "Data Analytics & AI",
    format: "Markdown (.md)",
    sizeLabel: "22 KB",
    summary:
      "Step-by-step SQL query templates, Python data cleaning recipes, and direct-labeled chart checklists.",
    content: `# Python & SQL Accessible Analytics Workbook

- Always include direct data labels on charts and tables.
- Use tabular numerals (font-variant-numeric: tabular-nums) for aligned columns.
- Core SQL pattern: SELECT track, COUNT(*) FROM learners GROUP BY track;`,
  },
  {
    id: "guide-color-safe-ui",
    courseId: "sav-ux-105",
    title: "Color-Vision Safe UI Tokens Reference",
    field: "UI/UX & Inclusive Design",
    format: "Markdown (.md)",
    sizeLabel: "15 KB",
    summary:
      "Contrast ratios (4.5:1 text / 3:1 UI), deuteranopia & tritanopia safe pairings, and typography sizing rules.",
    content: `# Color-Vision Safe UI Tokens Reference

- Contrast minimum: 4.5:1 for normal body prose, 3:1 for large headings & UI boundaries.
- Pair success/warning/error states with distinct icons and descriptive text.
- Support reduced-motion preferences by removing non-essential transitions.`,
  },
  {
    id: "guide-cloud-api",
    courseId: "sav-cloud-210",
    title: "Server-Side API Security & Secrets Guide",
    field: "Cloud & Cybersecurity",
    format: "Markdown (.md)",
    sizeLabel: "20 KB",
    summary:
      "Architecture notes for keeping AI & voice API keys strictly server-side, input validation, and graceful fallbacks.",
    content: `# Server-Side API Security & Secrets Guide

- Keep API credentials strictly in server environment variables.
- Validate request bodies before invoking downstream AI or TTS endpoints.
- Always implement graceful fallback paths when external services are unavailable.`,
  },
  {
    id: "guide-product-multilingual",
    courseId: "sav-prod-120",
    title: "Multilingual Product Strategy Brief",
    field: "Digital Marketing & Product",
    format: "Markdown (.md)",
    sizeLabel: "14 KB",
    summary:
      "Guidelines for Ethiopic script typography, clear plain-language copy, and inclusive user research across Ethiopia.",
    content: `# Multilingual Product Strategy Brief

- Pair Ethiopic script (Amharic, Tigrinya) with Noto Sans Ethiopic for crisp legibility.
- Label experimental or automated translations transparently.
- Respect local sign language systems (EthSL) rather than assuming universal mapping.`,
  },
  {
    id: "guide-mobile-voice",
    courseId: "sav-mob-240",
    title: "Voice-First & Low-Bandwidth Web Checklist",
    field: "Mobile Engineering",
    format: "Markdown (.md)",
    sizeLabel: "19 KB",
    summary:
      "Checklist for responsive touch targets, offline preference persistence, and synchronized voice-plus-caption interfaces.",
    content: `# Voice-First & Low-Bandwidth Web Checklist

- Persist user preferences locally so progress survives offline interruptions.
- Pair spoken audio prompts with immediate text captions for deaf/hard-of-hearing learners.
- Keep mobile sticky chrome compact to preserve reading space.`,
  },
];
