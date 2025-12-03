"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface TranscriptModalProps {
  sessionId: number;
  transcript: string;
  clientName: string;
  sessionDate: string;
}

export default function TranscriptModal({
  sessionId,
  transcript,
  clientName,
  sessionDate,
}: TranscriptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedTranscript = transcript.split("\n").map((line, i) => {
    const isTherapist = line.startsWith("THERAPIST:");
    const isClient = line.startsWith("CLIENT:");
    
    if (isTherapist || isClient) {
      const [speaker, ...rest] = line.split(":");
      const content = rest.join(":").trim();
      
      return (
        <div key={i} className={`mb-4 ${isTherapist ? "pl-0" : "pl-8"}`}>
          <span className={`text-xs font-semibold uppercase tracking-wide ${isTherapist ? "text-indigo-600" : "text-emerald-600"}`}>
            {speaker}
          </span>
          <p className="text-slate-700 mt-1">{content}</p>
        </div>
      );
    }
    
    if (line.trim()) {
      return (
        <p key={i} className="text-slate-600 mb-2">{line}</p>
      );
    }
    
    return null;
  });

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setIsOpen(true)}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Transcript
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Session Transcript
                </h2>
                <p className="text-sm text-slate-500">
                  {clientName} - {new Date(sessionDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm max-w-none">
                {formattedTranscript}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

