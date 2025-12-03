"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ManualTranscriptModalProps {
  clientId: number;
  clientName: string;
}

export default function ManualTranscriptModal({
  clientId,
  clientName,
}: ManualTranscriptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      alert("Please enter a transcript");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/manual-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          transcript: transcript.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      setTranscript("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Paste Transcript
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add Session Transcript
                </h2>
                <p className="text-sm text-gray-500">
                  Paste a therapy session transcript for {clientName}
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
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  Format each line with the speaker name followed by a colon:
                </p>
                <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-3 font-mono">
                  <p>Dr. Avery Rhodes: Hello, how are you feeling today?</p>
                  <p>{clientName}: I&apos;ve been feeling anxious lately...</p>
                </div>
              </div>
              
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your session transcript here..."
                className="w-full h-80 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
              
              <p className="mt-2 text-xs text-gray-500">
                {transcript.split('\n').filter(l => l.trim()).length} lines
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !transcript.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Session
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

