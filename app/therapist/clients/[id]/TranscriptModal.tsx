"use client";

import { useState } from "react";

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
    // Check if line starts with a name followed by colon (e.g., "Dr. Avery Rhodes:" or "Alex:")
    const speakerMatch = line.match(/^([^:]+):\s*(.*)/);
    
    if (speakerMatch) {
      const speaker = speakerMatch[1].trim();
      const content = speakerMatch[2].trim();
      
      // Determine if this is the therapist or client based on common patterns
      const isTherapist = speaker.toLowerCase().includes("dr.") || 
                          speaker.toLowerCase().includes("therapist") ||
                          speaker.toLowerCase() === "dr. avery rhodes";
      
      return (
        <div key={i} className={`mb-4 ${isTherapist ? "pl-0" : "pl-8"}`}>
          <span className={`text-xs font-semibold uppercase tracking-wide ${isTherapist ? "text-purple-400" : "text-emerald-400"}`}>
            {speaker}
          </span>
          <p className="text-gray-300 mt-1">{content}</p>
        </div>
      );
    }
    
    if (line.trim()) {
      return (
        <p key={i} className="text-gray-400 mb-2">{line}</p>
      );
    }
    
    return null;
  });

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Transcript
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Session Transcript
                </h2>
                <p className="text-sm text-gray-500">
                  {clientName} - {new Date(sessionDate).toLocaleDateString()}
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
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm prose-invert max-w-none">
                {formattedTranscript}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
