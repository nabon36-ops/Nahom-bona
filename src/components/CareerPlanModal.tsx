import React, { useState } from "react";
import { CareerPlan } from "../types";
import { CAREER_TRACKS, TARGET_SKILLS_POOL } from "../data/catalog";
import { X } from "lucide-react";

interface CareerPlanModalProps {
  careerPlan: CareerPlan;
  onSave: (plan: CareerPlan) => void;
  onClose: () => void;
}

export const CareerPlanModal: React.FC<CareerPlanModalProps> = ({
  careerPlan,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<CareerPlan>(careerPlan);

  const toggleSkill = (skill: string) => {
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-plan-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <h2 id="career-plan-modal-title" className="text-lg font-bold">
            Update Your Career Plan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md hover:bg-[#EAEEF2] dark:hover:bg-[#30363D]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-track" className="block text-xs font-medium mb-1">
                Target Career Field
              </label>
              <select
                id="modal-track"
                value={draft.targetTrack}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, targetTrack: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              >
                {CAREER_TRACKS.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-role" className="block text-xs font-medium mb-1">
                Target Role
              </label>
              <input
                id="modal-role"
                type="text"
                value={draft.targetRole}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, targetRole: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              />
            </div>

            <div>
              <label htmlFor="modal-exp" className="block text-xs font-medium mb-1">
                Experience Level
              </label>
              <select
                id="modal-exp"
                value={draft.experienceLevel}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    experienceLevel: e.target.value as CareerPlan["experienceLevel"],
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Career Switcher">Career Switcher</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-work" className="block text-xs font-medium mb-1">
                Preferred Work Style
              </label>
              <select
                id="modal-work"
                value={draft.workStyle}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    workStyle: e.target.value as CareerPlan["workStyle"],
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium mb-2">Target Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_SKILLS_POOL.map((skill) => {
                const active = draft.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 text-xs rounded-md border ${
                      active
                        ? "border-[#0969DA] bg-[#0969DA] text-white"
                        : "border-[#D0D7DE] dark:border-[#30363D]"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="modal-goal" className="block text-xs font-medium mb-1">
              Career Goal Statement
            </label>
            <input
              id="modal-goal"
              type="text"
              value={draft.goalStatement}
              onChange={(e) =>
                setDraft((p) => ({ ...p, goalStatement: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-[#0969DA] text-white hover:bg-[#0550AE]"
            >
              Save &amp; Re-Rank Recommendations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
