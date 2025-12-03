"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SessionActionsProps {
  clientId: number;
  personaId: string;
  sessionId?: number;
  sessionCount?: number;
  hasPlan?: boolean;
  hasSummary?: boolean;
  isInline?: boolean;
}

export default function SessionActions({
  clientId,
  personaId,
  sessionId,
  sessionCount = 0,
  hasPlan = false,
  hasSummary = false,
  isInline = false,
}: SessionActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerateSession = async () => {
    setLoadingAction("session");
    try {
      const response = await fetch("/api/simulate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientPersonaId: personaId,
          sessionNumber: sessionCount + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate session");
      }

      router.refresh();
    } catch (error) {
      console.error("Error generating session:", error);
      alert("Failed to generate session. Please check your OpenAI API key.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGeneratePlan = async () => {
    if (!sessionId) return;
    setLoadingAction("plan");
    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      router.refresh();
    } catch (error) {
      console.error("Error generating plan:", error);
      alert("Failed to generate plan. Please check your OpenAI API key.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!sessionId) return;
    setLoadingAction("summary");
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      router.refresh();
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate summary. Please check your OpenAI API key.");
    } finally {
      setLoadingAction(null);
    }
  };

  const buttonBase = "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonOutline = `${buttonBase} bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20`;
  const buttonPrimary = `${buttonBase} bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500`;

  if (isInline) {
    // Inline actions for individual sessions
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGeneratePlan}
          disabled={loadingAction !== null}
          className={buttonOutline}
        >
          {loadingAction === "plan" ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {hasPlan ? "Regenerate Plan" : "Generate Plan"}
        </button>
        <button
          onClick={handleGenerateSummary}
          disabled={loadingAction !== null}
          className={buttonOutline}
        >
          {loadingAction === "summary" ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          )}
          {hasSummary ? "Regenerate Summary" : "Generate Summary"}
        </button>
      </div>
    );
  }

  // Header action for generating new sessions
  return (
    <button
      onClick={handleGenerateSession}
      disabled={loadingAction !== null}
      className={buttonPrimary}
    >
      {loadingAction === "session" ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      New Session
    </button>
  );
}
