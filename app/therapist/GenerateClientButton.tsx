"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { ClientPersona } from "@/lib/personas";

interface GenerateClientButtonProps {
  persona: ClientPersona;
}

export default function GenerateClientButton({ persona }: GenerateClientButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/simulate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientPersonaId: persona.id,
          sessionNumber: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate session");
      }

      const data = await response.json();
      router.refresh();
      router.push(`/therapist/clients/${data.clientId}`);
    } catch (error) {
      console.error("Error generating session:", error);
      alert("Failed to generate session. Please check your OpenAI API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const isRiskPersona = persona.id === "sam";

  return (
    <Button
      onClick={handleGenerate}
      isLoading={isLoading}
      variant={isRiskPersona ? "outline" : "secondary"}
      className={isRiskPersona ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}
    >
      {isLoading ? "Generating..." : `+ ${persona.displayName}`}
      {isRiskPersona && !isLoading && (
        <svg className="w-4 h-4 ml-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
        </svg>
      )}
    </Button>
  );
}

