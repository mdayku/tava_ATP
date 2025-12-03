"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditPlanModalProps {
  planVersionId: number;
  therapistView: {
    presenting_concerns: string;
    clinical_impressions: string;
    goals: {
      short_term: string[];
      long_term: string[];
    };
    interventions: string[];
    homework: string[];
    strengths: string[];
    risk_indicators: string[];
  };
  sessionNumber: number;
}

export default function EditPlanModal({
  planVersionId,
  therapistView,
  sessionNumber,
}: EditPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState(therapistView);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planVersionId,
          therapistView: plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update plan");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Failed to update plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateArrayField = (field: keyof typeof plan, index: number, value: string) => {
    if (Array.isArray(plan[field])) {
      const newArray = [...(plan[field] as string[])];
      newArray[index] = value;
      setPlan({ ...plan, [field]: newArray });
    }
  };

  const addArrayItem = (field: keyof typeof plan) => {
    if (Array.isArray(plan[field])) {
      setPlan({ ...plan, [field]: [...(plan[field] as string[]), ""] });
    }
  };

  const removeArrayItem = (field: keyof typeof plan, index: number) => {
    if (Array.isArray(plan[field])) {
      const newArray = (plan[field] as string[]).filter((_, i) => i !== index);
      setPlan({ ...plan, [field]: newArray });
    }
  };

  const updateGoals = (type: "short_term" | "long_term", index: number, value: string) => {
    const newGoals = { ...plan.goals };
    newGoals[type] = [...newGoals[type]];
    newGoals[type][index] = value;
    setPlan({ ...plan, goals: newGoals });
  };

  const addGoal = (type: "short_term" | "long_term") => {
    const newGoals = { ...plan.goals };
    newGoals[type] = [...newGoals[type], ""];
    setPlan({ ...plan, goals: newGoals });
  };

  const removeGoal = (type: "short_term" | "long_term", index: number) => {
    const newGoals = { ...plan.goals };
    newGoals[type] = newGoals[type].filter((_, i) => i !== index);
    setPlan({ ...plan, goals: newGoals });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Edit Treatment Plan
                </h2>
                <p className="text-sm text-gray-500">
                  Session #{sessionNumber}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Presenting Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Presenting Concerns
                </label>
                <textarea
                  value={plan.presenting_concerns}
                  onChange={(e) => setPlan({ ...plan, presenting_concerns: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Clinical Impressions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clinical Impressions
                </label>
                <textarea
                  value={plan.clinical_impressions}
                  onChange={(e) => setPlan({ ...plan, clinical_impressions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              {/* Short-term Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Short-term Goals</label>
                  <button
                    onClick={() => addGoal("short_term")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Add Goal
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.goals.short_term.map((goal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={goal}
                        onChange={(e) => updateGoals("short_term", idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeGoal("short_term", idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long-term Goals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Long-term Goals</label>
                  <button
                    onClick={() => addGoal("long_term")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Add Goal
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.goals.long_term.map((goal, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={goal}
                        onChange={(e) => updateGoals("long_term", idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeGoal("long_term", idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Homework</label>
                  <button
                    onClick={() => addArrayItem("homework")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.homework.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateArrayField("homework", idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem("homework", idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Strengths</label>
                  <button
                    onClick={() => addArrayItem("strengths")}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Add Strength
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.strengths.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateArrayField("strengths", idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem("strengths", idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Indicators */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-400">Risk Indicators</label>
                  <button
                    onClick={() => addArrayItem("risk_indicators")}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Add Indicator
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.risk_indicators.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateArrayField("risk_indicators", idx, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem("risk_indicators", idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPlan(therapistView);
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

