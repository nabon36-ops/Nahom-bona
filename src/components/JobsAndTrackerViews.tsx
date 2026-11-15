import React, { useMemo, useState } from "react";
import {
  ApplicationStatus,
  JobApplication,
  JobOpportunity,
  UserProfile,
} from "../types";
import { RankedJob } from "../data/catalog";
import { Bookmark, CheckCircle2, Calendar, Volume2 } from "lucide-react";

interface JobsViewProps {
  user: UserProfile;
  rankedJobs: RankedJob[];
  applications: JobApplication[];
  onSaveOrApplyJob: (jobId: string, status: ApplicationStatus) => void;
  onSpeakText: (text: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  user,
  rankedJobs,
  applications,
  onSaveOrApplyJob,
  onSpeakText,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [workModeFilter, setWorkModeFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    return rankedJobs.filter(({ job }) => {
      if (typeFilter !== "All" && job.opportunityType !== typeFilter) return false;
      if (workModeFilter !== "All" && job.workMode !== workModeFilter) return false;
      return true;
    });
  }, [rankedJobs, typeFilter, workModeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]">
            Example Career Opportunities · Personalized for {user.careerPlan.targetRole}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Recommended Jobs &amp; Internships
          </h1>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
            Ranked against your Career Plan ({user.careerPlan.targetTrack} · {user.careerPlan.workStyle}). Clearly labelled sample opportunities for demonstration.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filter by opportunity type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
          >
            <option value="All">All Opportunity Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Entry-Level">Entry-Level</option>
            <option value="Internship">Internship</option>
            <option value="Career Development">Career Development</option>
          </select>

          <select
            aria-label="Filter by work mode"
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
          >
            <option value="All">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(
          ({ job, matchScore, matchedSkills, missingSkills, matchReasons }) => {
            const existing = applications.find((a) => a.jobId === job.id);
            return (
              <article
                key={job.id}
                className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                        {job.company} · {job.opportunityType} · {job.workMode}
                      </div>
                      <h2 className="text-base font-bold mt-0.5">{job.title}</h2>
                      <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                        {job.location} · {job.postedLabel}
                      </div>
                    </div>
                    <span className="text-sm font-mono tabular-nums font-bold text-[#0969DA] dark:text-[#58A6FF] shrink-0">
                      {matchScore}% match
                    </span>
                  </div>

                  <p className="text-sm text-[#656D76] dark:text-[#8B949E] leading-relaxed">
                    {job.summary}
                  </p>

                  <div className="text-xs space-y-1">
                    <div>
                      <span className="font-semibold">Why recommended: </span>
                      <span>{matchReasons.join(" · ")}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#1A7F37] dark:text-[#3FB950]">
                        Matched skills:{" "}
                      </span>
                      <span>
                        {matchedSkills.length > 0
                          ? matchedSkills.join(", ")
                          : "Build foundational skills in Courses"}
                      </span>
                    </div>
                    {missingSkills.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#9A6700] dark:text-[#D29922]">
                          Skills to add:{" "}
                        </span>
                        <span>{missingSkills.join(", ")}</span>
                      </div>
                    )}
                    <div className="text-[#656D76] dark:text-[#8B949E]">
                      Inclusion notes: {job.accessibilityHighlights.join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D0D7DE] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSaveOrApplyJob(job.id, "Applied")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {existing?.status === "Applied"
                          ? "Applied (Tracked)"
                          : "Mark as Applied"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveOrApplyJob(job.id, "Saved")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] hover:bg-[#F6F8FA] dark:hover:bg-[#21262D]"
                    >
                      <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{existing ? existing.status : "Save"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSpeakText(
                        `${job.title} at ${job.company}. ${job.workMode}. ${job.summary}`
                      )
                    }
                    aria-label={`Read ${job.title} aloud`}
                    className="p-2 rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
};

interface TrackerViewProps {
  jobs: JobOpportunity[];
  applications: JobApplication[];
  onUpdateApplication: (
    jobId: string,
    patch: Partial<JobApplication>
  ) => void;
  onRemoveApplication: (jobId: string) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  jobs,
  applications,
  onUpdateApplication,
  onRemoveApplication,
}) => {
  const statuses: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "Interview",
    "Offer",
    "Archived",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Job Application Tracker
        </h1>
        <p className="text-sm text-[#656D76] dark:text-[#8B949E] mt-1">
          Record application dates, update pipeline status, and manage interview reminders.
        </p>
      </div>

      {/* Summary Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statuses.map((st) => {
          const count = applications.filter((a) => a.status === st).length;
          return (
            <div
              key={st}
              className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-3.5"
            >
              <div className="text-xs text-[#656D76] dark:text-[#8B949E]">{st}</div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1">
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {applications.length === 0 ? (
        <div className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-8 text-center">
          <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
            No applications tracked yet. Save or apply to an opportunity in the Jobs tab.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const job = jobs.find((j) => j.id === app.jobId);
            if (!job) return null;
            return (
              <div
                key={app.jobId}
                className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-4 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold">{job.title}</h2>
                    <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                      {job.company} · {job.workMode} · Last updated {app.updatedAt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`status-${app.jobId}`}>
                      Application status
                    </label>
                    <select
                      id={`status-${app.jobId}`}
                      value={app.status}
                      onChange={(e) =>
                        onUpdateApplication(app.jobId, {
                          status: e.target.value as ApplicationStatus,
                          updatedAt: new Date().toISOString().slice(0, 10),
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onRemoveApplication(app.jobId)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149] hover:bg-[#CF222E]/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label
                      htmlFor={`date-${app.jobId}`}
                      className="block text-[#656D76] dark:text-[#8B949E] mb-1"
                    >
                      Application Date
                    </label>
                    <input
                      id={`date-${app.jobId}`}
                      type="date"
                      value={app.appliedDate}
                      onChange={(e) =>
                        onUpdateApplication(app.jobId, { appliedDate: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`reminder-${app.jobId}`}
                      className="flex items-center gap-1 text-[#656D76] dark:text-[#8B949E] mb-1"
                    >
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Follow-up Reminder</span>
                    </label>
                    <input
                      id={`reminder-${app.jobId}`}
                      type="date"
                      value={app.reminderDate}
                      onChange={(e) =>
                        onUpdateApplication(app.jobId, { reminderDate: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`notes-${app.jobId}`}
                      className="block text-[#656D76] dark:text-[#8B949E] mb-1"
                    >
                      Notes
                    </label>
                    <input
                      id={`notes-${app.jobId}`}
                      type="text"
                      value={app.notes}
                      onChange={(e) =>
                        onUpdateApplication(app.jobId, { notes: e.target.value })
                      }
                      placeholder="Interview prep or contact note..."
                      className="w-full px-2.5 py-1.5 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
