"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  
  const gradients: Record<string, string> = {
    alex: "from-indigo-500 to-purple-600",
    jordan: "from-emerald-500 to-teal-600",
    maya: "from-pink-500 to-rose-600",
    sam: "from-amber-500 to-orange-600",
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isRiskPersona
          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
          : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20"
      }`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradients[persona.id] || "from-gray-500 to-gray-600"} flex items-center justify-center text-white text-xs font-bold`}>
            {persona.displayName[0]}
          </div>
          <span>{persona.displayName}</span>
          {isRiskPersona && (
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          )}
        </>
      )}
    </button>
  );
}
