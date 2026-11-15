export type LanguageCode = "en" | "am" | "om" | "so" | "ti";

export type DisabilityType =
  | "blind"
  | "deaf"
  | "motor"
  | "color"
  | "standard";

export type ColorConfusionOption =
  | "red_green"
  | "green_brown"
  | "blue_yellow"
  | "blue_purple"
  | "most_colors"
  | "other"
  | "not_sure";

export type SignLanguageSystem = "EthSL" | "ASL" | "IS";

export type AppView =
  | "dashboard"
  | "courses"
  | "resources"
  | "progress"
  | "jobs"
  | "tracker"
  | "linkedin"
  | "assistant"
  | "settings";

export interface CareerPlan {
  targetTrack: string;
  targetRole: string;
  experienceLevel: "Beginner" | "Entry-Level" | "Intermediate" | "Career Switcher";
  workStyle: "Remote" | "Hybrid" | "On-site" | "Internship";
  skills: string[];
  goalStatement: string;
}

export interface UserProfile {
  signedIn: boolean;
  name: string;
  email: string;
  careerPlan: CareerPlan;
}

export interface AccessibilityPreferences {
  language: LanguageCode;
  disabilities: DisabilityType[];
  colorConfusions: ColorConfusionOption[];
  theme: "light" | "dark";
  textScale: number; // 0.9 to 1.35
  highContrast: boolean;
  reducedMotion: boolean;
  captionsEnabled: boolean;
  voiceInstructorEnabled: boolean;
  signLanguageSystem: SignLanguageSystem;
  signDockOpen: boolean;
  screenReaderVerbosity: "standard" | "detailed";
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  field: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  lessonsCount: number;
  skills: string[];
  description: string;
  isNew?: boolean;
  isUpdated?: boolean;
  trackTags: string[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  opportunityType: "Full-time" | "Internship" | "Entry-Level" | "Career Development";
  workMode: "Remote" | "Hybrid" | "On-site";
  track: string;
  skillsRequired: string[];
  summary: string;
  accessibilityHighlights: string[];
  postedLabel: string;
}

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Archived";

export interface JobApplication {
  jobId: string;
  status: ApplicationStatus;
  appliedDate: string;
  reminderDate: string;
  notes: string;
  updatedAt: string;
}

export interface MilestoneNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface SignDetectionResult {
  detectedSign: string;
  confidence: number;
  actionType: "navigate" | "complete_lesson" | "read_aloud" | "none";
  actionTarget: string;
  replyInLanguage: string;
  provider?: string;
}

export interface StudyGuide {
  id: string;
  courseId: string;
  title: string;
  field: string;
  format: string;
  sizeLabel: string;
  summary: string;
  content: string;
}
