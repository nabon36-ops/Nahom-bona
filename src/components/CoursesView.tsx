import React, { useMemo, useState } from "react";
import { Course, LanguageCode, SignLanguageSystem, StudyGuide, UserProfile } from "../types";
import { CAREER_TRACKS, RankedCourse } from "../data/catalog";
import { TRANSLATIONS } from "../i18n/translations";
import { SignLanguageBasicsSection } from "./SignLanguageBasicsSection";
import { Bookmark, CheckCircle2, Download, Search, Volume2 } from "lucide-react";

interface CoursesViewProps {
  language: LanguageCode;
  signLanguageSystem: SignLanguageSystem;
  reducedMotion: boolean;
  user: UserProfile;
  rankedCourses: RankedCourse[];
  studyGuides: StudyGuide[];
  enrolledCourseIds: string[];
  bookmarkedCourseIds: string[];
  downloadedGuides: Record<string, string>;
  courseProgress: Record<string, number>;
  onChangeSignSystem: (sys: SignLanguageSystem) => void;
  onToggleBookmark: (courseId: string) => void;
  onEnrollCourse: (courseId: string) => void;
  onCompleteLesson: (course: Course) => void;
  onDownloadGuide: (guide: StudyGuide) => void;
  onSpeakText: (text: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  language,
  signLanguageSystem,
  reducedMotion,
  user,
  rankedCourses,
  studyGuides,
  enrolledCourseIds,
  bookmarkedCourseIds,
  downloadedGuides,
  courseProgress,
  onChangeSignSystem,
  onToggleBookmark,
  onEnrollCourse,
  onCompleteLesson,
  onDownloadGuide,
  onSpeakText,
}) => {
  const t = TRANSLATIONS[language];
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const filtered = useMemo(() => {
    return rankedCourses.filter(({ course }) => {
      if (fieldFilter !== "All" && course.field !== fieldFilter) return false;
      if (difficultyFilter !== "All" && course.difficulty !== difficultyFilter)
        return false;
      if (onlyBookmarked && !bookmarkedCourseIds.includes(course.id))
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q) ||
          course.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [
    rankedCourses,
    fieldFilter,
    difficultyFilter,
    onlyBookmarked,
    bookmarkedCourseIds,
    search,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]">
            {t.dashboard.demoCourseBadge} · Ranked for {user.careerPlan.targetRole}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Savannah Course Catalogue
          </h1>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
            Sample demonstration courses aligned with your Career Plan ({user.careerPlan.targetTrack}).
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeakText(
              `Showing ${filtered.length} Savannah demonstration courses ranked for your ${user.careerPlan.targetRole} career plan.`
            )
          }
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] whitespace-nowrap shrink-0"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Read Catalogue</span>
        </button>
      </div>

      {/* Filters */}
      <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#656D76] absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or skills..."
            aria-label="Search courses or skills"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          />
        </div>

        <select
          aria-label="Filter by career field"
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
        >
          <option value="All">All Career Fields</option>
          {CAREER_TRACKS.map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by difficulty"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
        >
          <option value="All">All Difficulty Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button
          type="button"
          onClick={() => setOnlyBookmarked((b) => !b)}
          aria-pressed={onlyBookmarked}
          className={`inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border ${
            onlyBookmarked
              ? "border-[#0969DA] bg-[#0969DA]/10 text-[#0969DA] dark:text-[#58A6FF]"
              : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          }`}
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          <span>Bookmarked ({bookmarkedCourseIds.length})</span>
        </button>
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-8 text-center space-y-2">
          <p className="text-sm font-medium">No courses match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFieldFilter("All");
              setDifficultyFilter("All");
              setOnlyBookmarked(false);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ course, matchScore, matchReasons }) => {
            const enrolled = enrolledCourseIds.includes(course.id);
            const bookmarked = bookmarkedCourseIds.includes(course.id);
            const done = courseProgress[course.id] || 0;
            const pct = Math.round((done / course.lessonsCount) * 100);
            const completed = done >= course.lessonsCount;

            return (
              <article
                key={course.id}
                className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                        {course.provider} · {course.difficulty} · {course.durationHours}h
                        {course.isNew ? " · New" : course.isUpdated ? " · Updated" : ""}
                      </div>
                      <h2 className="text-base font-bold leading-snug">
                        {course.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(course.id)}
                      aria-label={
                        bookmarked
                          ? `Remove ${course.title} bookmark`
                          : `Bookmark ${course.title}`
                      }
                      aria-pressed={bookmarked}
                      className={`p-2 rounded-md border shrink-0 ${
                        bookmarked
                          ? "border-[#0969DA] text-[#0969DA] dark:text-[#58A6FF]"
                          : "border-[#D0D7DE] dark:border-[#30363D] text-[#656D76]"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="text-sm text-[#656D76] dark:text-[#8B949E] leading-relaxed">
                    {course.description}
                  </p>

                  <div className="text-xs">
                    <span className="font-semibold text-[#1A7F37] dark:text-[#3FB950] font-mono tabular-nums">
                      {matchScore}% Career Plan Fit
                    </span>
                    <span className="text-[#656D76] dark:text-[#8B949E]">
                      {" "}
                      · {matchReasons.join(" · ")}
                    </span>
                  </div>

                  <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                    Skills: <span className="text-[#1F2328] dark:text-[#E6EDF3]">{course.skills.join(", ")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] space-y-3">
                  {enrolled && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {done}/{course.lessonsCount} lessons completed
                        </span>
                        <span className="font-mono tabular-nums font-semibold">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#D0D7DE] dark:bg-[#30363D] overflow-hidden">
                        <div
                          className="h-full bg-[#0969DA] dark:bg-[#58A6FF]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {!enrolled ? (
                      <button
                        type="button"
                        onClick={() => onEnrollCourse(course.id)}
                        className="px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                      >
                        Enroll &amp; Start Course
                      </button>
                    ) : completed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A7F37] dark:text-[#3FB950]">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCompleteLesson(course)}
                        className="px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                      >
                        {t.dashboard.completeLesson}
                      </button>
                    )}
                    <div className="flex items-center gap-2">
                      {(() => {
                        const guide = studyGuides.find((g) => g.courseId === course.id);
                        if (!guide) return null;
                        const isDownloaded = Boolean(downloadedGuides[guide.id]);
                        return (
                          <button
                            type="button"
                            onClick={() => onDownloadGuide(guide)}
                            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
                          >
                            <Download className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{isDownloaded ? "Guide Saved" : "Study Guide"}</span>
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() =>
                          onSpeakText(`${course.title}. ${course.description}`)
                        }
                        className="px-3 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
                      >
                        Listen
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Sign Language Basics Short Video Tutorials */}
      <SignLanguageBasicsSection
        language={language}
        signLanguageSystem={signLanguageSystem}
        reducedMotion={reducedMotion}
        onChangeSignSystem={onChangeSignSystem}
        onSpeakText={onSpeakText}
      />
    </div>
  );
};
