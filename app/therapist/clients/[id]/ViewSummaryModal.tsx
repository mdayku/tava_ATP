"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

interface ViewSummaryModalProps {
  sessionNumber: number;
  sessionDate: string;
  clientName: string;
  therapistView: {
    raw_text: string;
    bullet_points: string[];
  };
  clientView: {
    headline: string;
    what_we_did: string[];
    next_steps: string[];
  };
}

export default function ViewSummaryModal({
  sessionNumber,
  sessionDate,
  clientName,
  therapistView,
  clientView,
}: ViewSummaryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"therapist" | "client">("therapist");

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      
      if (y + lines.length * (fontSize * 0.5) > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.5) + 5;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Session Summary", margin, y);
    y += 10;

    // Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Client: ${clientName}`, margin, y);
    y += 5;
    doc.text(`Session #${sessionNumber} - ${new Date(sessionDate).toLocaleDateString()}`, margin, y);
    y += 15;

    // Therapist Summary
    addText("CLINICAL SUMMARY", 14, true);
    y += 3;
    
    if (therapistView?.raw_text) {
      addText(therapistView.raw_text, 10);
    }
    
    if (therapistView?.bullet_points && therapistView.bullet_points.length > 0) {
      y += 5;
      addText("Key Points:", 11, true);
      therapistView.bullet_points.forEach((point) => {
        addText(`- ${point}`, 10);
      });
    }

    y += 10;

    // Client Summary
    addText("CLIENT-FRIENDLY SUMMARY", 14, true);
    y += 3;
    
    if (clientView?.headline) {
      addText(clientView.headline, 12, true);
    }
    
    if (clientView?.what_we_did && clientView.what_we_did.length > 0) {
      y += 5;
      addText("What We Worked On:", 11, true);
      clientView.what_we_did.forEach((item) => {
        addText(`- ${item}`, 10);
      });
    }
    
    if (clientView?.next_steps && clientView.next_steps.length > 0) {
      y += 5;
      addText("Next Steps:", 11, true);
      clientView.next_steps.forEach((item) => {
        addText(`- ${item}`, 10);
      });
    }

    doc.save(`session-summary-${clientName}-session${sessionNumber}.pdf`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Summary
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Session Summary - Session #{sessionNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  {clientName} - {new Date(sessionDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-2">
              <button
                onClick={() => setActiveTab("therapist")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "therapist"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                Clinical View
              </button>
              <button
                onClick={() => setActiveTab("client")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "client"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                Client View
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === "therapist" ? (
                <div className="space-y-4">
                  {therapistView?.raw_text && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Clinical Summary
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {therapistView.raw_text}
                      </p>
                    </div>
                  )}

                  {therapistView?.bullet_points && therapistView.bullet_points.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {therapistView.bullet_points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-purple-400">-</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {clientView?.headline && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-emerald-300 font-medium text-lg">
                        {clientView.headline}
                      </p>
                    </div>
                  )}

                  {clientView?.what_we_did && clientView.what_we_did.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        What We Worked On
                      </h4>
                      <ul className="space-y-2">
                        {clientView.what_we_did.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {clientView?.next_steps && clientView.next_steps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {clientView.next_steps.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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

