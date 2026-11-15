import React, { useMemo, useState } from "react";
import { Course, StudyGuide } from "../types";
import {
  Bookmark,
  BookOpen,
  Download,
  FileText,
  Search,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

interface ResourcesViewProps {
  courses: Course[];
  studyGuides: StudyGuide[];
  enrolledCourseIds: string[];
  bookmarkedCourseIds: string[];
  bookmarkedGuideIds: string[];
  downloadedGuides: Record<string, string>;
  onToggleBookmarkCourse: (courseId: string) => void;
  onToggleBookmarkGuide: (guideId: string) => void;
  onDownloadGuide: (guide: StudyGuide) => void;
  onRemoveDownloadedGuide: (guideId: string) => void;
  onOpenCourseInCatalog: (courseId: string) => void;
  onSpeakText: (text: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  courses,
  studyGuides,
  enrolledCourseIds,
  bookmarkedCourseIds,
  bookmarkedGuideIds,
  downloadedGuides,
  onToggleBookmarkCourse,
  onToggleBookmarkGuide,
  onDownloadGuide,
  onRemoveDownloadedGuide,
  onOpenCourseInCatalog,
  onSpeakText,
}) => {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "bookmarked" | "downloaded" | "library"
  >("all");
  const [previewGuide, setPreviewGuide] = useState<StudyGuide | null>(null);

  const bookmarkedCourses = useMemo(
    () =>
      courses.filter((c) => {
        if (!bookmarkedCourseIds.includes(c.id)) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.field.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
        );
      }),
    [courses, bookmarkedCourseIds, search]
  );

  const bookmarkedGuides = useMemo(
    () =>
      studyGuides.filter((g) => {
        if (!bookmarkedGuideIds.includes(g.id)) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.field.toLowerCase().includes(q)
        );
      }),
    [studyGuides, bookmarkedGuideIds, search]
  );

  const downloadedGuideList = useMemo(
    () =>
      studyGuides.filter((g) => {
        if (!downloadedGuides[g.id]) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.field.toLowerCase().includes(q)
        );
      }),
    [studyGuides, downloadedGuides, search]
  );

  const libraryGuides = useMemo(
    () =>
      studyGuides.filter((g) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.field.toLowerCase().includes(q)
        );
      }),
    [studyGuides, search]
  );

  const totalBookmarkedCount =
    bookmarkedCourseIds.length + bookmarkedGuideIds.length;
  const downloadedCount = Object.keys(downloadedGuides).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]">
            Centralized Study Library
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Learning Resources
          </h1>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
            Access all bookmarked courses, saved study guides, and downloaded materials in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onSpeakText(
              `Learning Resources. You have ${totalBookmarkedCount} bookmarked materials and ${downloadedCount} downloaded study guides.`
            )
          }
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] whitespace-nowrap shrink-0"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Read Summary</span>
        </button>
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4">
          <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
            Bookmarked Materials
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1">
            {totalBookmarkedCount}
          </div>
        </div>
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4">
          <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
            Downloaded Study Guides
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1">
            {downloadedCount}
          </div>
        </div>
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4">
          <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
            Available Study Guides
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums mt-1">
            {studyGuides.length}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[#656D76] absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarked materials or study guides..."
            aria-label="Search learning resources"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter learning resources"
          className="inline-flex flex-wrap rounded-md border border-[#D0D7DE] dark:border-[#30363D] p-0.5 bg-[#F6F8FA] dark:bg-[#0D1117]"
        >
          {(
            [
              ["all", "All Resources"],
              ["bookmarked", "Bookmarked"],
              ["downloaded", "Downloaded Guides"],
              ["library", "Study Guide Library"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterTab(id)}
              aria-pressed={filterTab === id}
              className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                filterTab === id
                  ? "bg-[#0969DA] text-white dark:bg-[#58A6FF] dark:text-[#0D1117]"
                  : "text-[#656D76] dark:text-[#8B949E]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Bookmarked Courses & Materials */}
      {(filterTab === "all" || filterTab === "bookmarked") && (
        <section
          aria-labelledby="bookmarked-materials-heading"
          className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Bookmark
              className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]"
              aria-hidden="true"
            />
            <h2 id="bookmarked-materials-heading" className="text-base font-semibold">
              Bookmarked Courses &amp; Materials
            </h2>
          </div>

          {bookmarkedCourses.length === 0 && bookmarkedGuides.length === 0 ? (
            <div className="p-6 text-center rounded-md border border-dashed border-[#D0D7DE] dark:border-[#30363D] text-xs text-[#656D76] dark:text-[#8B949E]">
              No bookmarked materials match your search. Bookmark courses in the Courses tab or study guides below.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarkedCourses.map((course) => {
                const enrolled = enrolledCourseIds.includes(course.id);
                return (
                  <article
                    key={course.id}
                    className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                        Bookmarked Course · {course.field} · {course.durationHours}h
                      </div>
                      <h3 className="text-sm font-bold">{course.title}</h3>
                      <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
                      <button
                        type="button"
                        onClick={() => onOpenCourseInCatalog(course.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] text-white dark:bg-[#238636]"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{enrolled ? "Open Course" : "Enroll & Open"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleBookmarkCourse(course.id)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                      >
                        Remove Bookmark
                      </button>
                    </div>
                  </article>
                );
              })}

              {bookmarkedGuides.map((guide) => (
                <article
                  key={`bm-${guide.id}`}
                  className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      Bookmarked Study Guide · {guide.field} · {guide.sizeLabel}
                    </div>
                    <h3 className="text-sm font-bold">{guide.title}</h3>
                    <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {guide.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewGuide(guide)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] text-white"
                      >
                        Read Guide
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadGuide(guide)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Download</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleBookmarkGuide(guide.id)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Downloaded Study Guides */}
      {(filterTab === "all" || filterTab === "downloaded") && (
        <section
          aria-labelledby="downloaded-guides-heading"
          className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Download
              className="w-4 h-4 text-[#1A7F37] dark:text-[#3FB950]"
              aria-hidden="true"
            />
            <h2 id="downloaded-guides-heading" className="text-base font-semibold">
              Downloaded Study Guides
            </h2>
          </div>

          {downloadedGuideList.length === 0 ? (
            <div className="p-6 text-center rounded-md border border-dashed border-[#D0D7DE] dark:border-[#30363D] text-xs text-[#656D76] dark:text-[#8B949E]">
              No study guides downloaded yet. Download any guide from the library below.
            </div>
          ) : (
            <div className="divide-y divide-[#D0D7DE] dark:divide-[#30363D]">
              {downloadedGuideList.map((guide) => (
                <div
                  key={`dl-${guide.id}`}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF] shrink-0" aria-hidden="true" />
                      <h3 className="text-sm font-bold">{guide.title}</h3>
                    </div>
                    <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {guide.field} · {guide.format} · {guide.sizeLabel} · Downloaded {downloadedGuides[guide.id]}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewGuide(guide)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white"
                    >
                      Read Offline Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadGuide(guide)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Save File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSpeakText(`${guide.title}. ${guide.summary}`)}
                      aria-label={`Read ${guide.title} summary aloud`}
                      className="p-1.5 rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveDownloadedGuide(guide.id)}
                      aria-label={`Remove ${guide.title} from downloaded list`}
                      className="p-1.5 rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Full Savannah Study Guide Library */}
      {(filterTab === "all" || filterTab === "library") && (
        <section
          aria-labelledby="study-guide-library-heading"
          className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-4"
        >
          <h2 id="study-guide-library-heading" className="text-base font-semibold">
            Savannah Study Guide Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {libraryGuides.map((guide) => {
              const isDownloaded = Boolean(downloadedGuides[guide.id]);
              const isBookmarked = bookmarkedGuideIds.includes(guide.id);
              return (
                <article
                  key={guide.id}
                  className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {guide.field} · {guide.sizeLabel}
                    </div>
                    <h3 className="text-sm font-bold leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#656D76] dark:text-[#8B949E] leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
                    <button
                      type="button"
                      onClick={() => onDownloadGuide(guide)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isDownloaded ? "Downloaded" : "Download Guide"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBookmarkGuide(guide.id)}
                      aria-pressed={isBookmarked}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border ${
                        isBookmarked
                          ? "border-[#0969DA] text-[#0969DA] dark:text-[#58A6FF]"
                          : "border-[#D0D7DE] dark:border-[#30363D]"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isBookmarked ? "Saved" : "Bookmark"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Study Guide Reader Modal */}
      {previewGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-preview-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                  {previewGuide.field} · {previewGuide.format}
                </div>
                <h2 id="guide-preview-title" className="text-lg font-bold mt-0.5">
                  {previewGuide.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewGuide(null)}
                aria-label="Close study guide reader"
                className="p-1.5 rounded-md hover:bg-[#EAEEF2] dark:hover:bg-[#30363D]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <pre className="p-4 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {previewGuide.content}
            </pre>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSpeakText(previewGuide.content)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
              >
                <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Read Guide Aloud</span>
              </button>
              <button
                type="button"
                onClick={() => onDownloadGuide(previewGuide)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] text-white"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
