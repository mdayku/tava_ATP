"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

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

  if (isInline) {
    // Inline actions for individual sessions
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleGeneratePlan}
          isLoading={loadingAction === "plan"}
          disabled={loadingAction !== null}
        >
          {hasPlan ? "Regenerate Plan" : "Generate Plan"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerateSummary}
          isLoading={loadingAction === "summary"}
          disabled={loadingAction !== null}
        >
          {hasSummary ? "Regenerate Summary" : "Generate Summary"}
        </Button>
      </div>
    );
  }

  // Header action for generating new sessions
  return (
    <Button
      onClick={handleGenerateSession}
      isLoading={loadingAction === "session"}
      disabled={loadingAction !== null}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Session
    </Button>
  );
}

