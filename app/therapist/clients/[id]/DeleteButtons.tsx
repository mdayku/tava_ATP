"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSessionButtonProps {
  sessionId: number;
  sessionNumber: number;
}

export function DeleteSessionButton({ sessionId, sessionNumber }: DeleteSessionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-xs text-gray-400">Delete session #{sessionNumber}?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-2 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200"
      title="Delete session"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

interface DeletePlanButtonProps {
  planId: number;
}

export function DeletePlanButton({ planId }: DeletePlanButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this treatment plan version?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete plan");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete plan. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
      title="Delete plan"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      {isDeleting ? "..." : "Delete"}
    </button>
  );
}

interface DeleteSummaryButtonProps {
  summaryId: number;
}

export function DeleteSummaryButton({ summaryId }: DeleteSummaryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this session summary?")) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete summary");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting summary:", error);
      alert("Failed to delete summary. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
      title="Delete summary"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      {isDeleting ? "..." : "Delete"}
    </button>
  );
}

