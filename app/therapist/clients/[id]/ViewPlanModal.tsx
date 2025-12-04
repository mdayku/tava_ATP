"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

interface ViewPlanModalProps {
  sessionNumber: number;
  sessionDate: string;
  clientName: string;
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
  versionNumber: number;
}

export default function ViewPlanModal({
  sessionNumber,
  sessionDate,
  clientName,
  therapistView,
  versionNumber,
}: ViewPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);
      
      // Check if we need a new page
      if (y + lines.length * (fontSize * 0.5) > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(lines, margin, y);
      y += lines.length * (fontSize * 0.5) + 5;
    };

    const addSection = (title: string, content: string | string[]) => {
      addText(title, 12, true);
      if (Array.isArray(content)) {
        content.forEach((item, idx) => {
          addText(`${idx + 1}. ${item}`, 10);
        });
      } else {
        addText(content || "Not specified", 10);
      }
      y += 5;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Treatment Plan", margin, y);
    y += 10;

    // Header info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Client: ${clientName}`, margin, y);
    y += 5;
    doc.text(`Session #${sessionNumber} - ${new Date(sessionDate).toLocaleDateString()}`, margin, y);
    y += 5;
    doc.text(`Plan Version: ${versionNumber}`, margin, y);
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // Content sections
    addSection("Presenting Concerns", therapistView.presenting_concerns || "");
    addSection("Clinical Impressions", therapistView.clinical_impressions || "");
    addSection("Short-term Goals", Array.isArray(therapistView.goals?.short_term) ? therapistView.goals.short_term : []);
    addSection("Long-term Goals", Array.isArray(therapistView.goals?.long_term) ? therapistView.goals.long_term : []);
    addSection("Interventions", Array.isArray(therapistView.interventions) ? therapistView.interventions : []);
    addSection("Homework", Array.isArray(therapistView.homework) ? therapistView.homework : []);
    addSection("Strengths", Array.isArray(therapistView.strengths) ? therapistView.strengths : []);
    
    if (Array.isArray(therapistView.risk_indicators) && therapistView.risk_indicators.length > 0) {
      addSection("Risk Indicators", therapistView.risk_indicators);
    }

    // Save
    doc.save(`treatment-plan-${clientName}-session${sessionNumber}.pdf`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Full Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-[#12121a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Treatment Plan - Session #{sessionNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  {clientName} - Version {versionNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all"
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Presenting Concerns */}
              <Section title="Presenting Concerns" color="purple">
                <p className="text-gray-300">{therapistView.presenting_concerns || "Not specified"}</p>
              </Section>

              {/* Clinical Impressions */}
              <Section title="Clinical Impressions" color="blue">
                <p className="text-gray-300">{therapistView.clinical_impressions || "Not specified"}</p>
              </Section>

              {/* Goals */}
              <div className="grid md:grid-cols-2 gap-4">
                <Section title="Short-term Goals" color="emerald">
                  {Array.isArray(therapistView.goals?.short_term) && therapistView.goals.short_term.length > 0 ? (
                    <ul className="space-y-2">
                      {therapistView.goals.short_term.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No goals set</p>
                  )}
                </Section>

                <Section title="Long-term Goals" color="violet">
                  {Array.isArray(therapistView.goals?.long_term) && therapistView.goals.long_term.length > 0 ? (
                    <ul className="space-y-2">
                      {therapistView.goals.long_term.map((goal, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <span className="text-violet-400 font-bold">{idx + 1}.</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No goals set</p>
                  )}
                </Section>
              </div>

              {/* Interventions */}
              <Section title="Interventions" color="cyan">
                {Array.isArray(therapistView.interventions) && therapistView.interventions.length > 0 ? (
                  <ul className="space-y-2">
                    {therapistView.interventions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-cyan-400">-</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No interventions specified</p>
                )}
              </Section>

              {/* Homework */}
              <Section title="Homework" color="amber">
                {Array.isArray(therapistView.homework) && therapistView.homework.length > 0 ? (
                  <ul className="space-y-2">
                    {therapistView.homework.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-amber-400 font-bold">{idx + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No homework assigned</p>
                )}
              </Section>

              {/* Strengths */}
              <Section title="Strengths" color="emerald">
                {Array.isArray(therapistView.strengths) && therapistView.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {therapistView.strengths.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No strengths identified</p>
                )}
              </Section>

              {/* Risk Indicators */}
              {Array.isArray(therapistView.risk_indicators) && therapistView.risk_indicators.length > 0 && (
                <Section title="Risk Indicators" color="red">
                  <ul className="space-y-2">
                    {therapistView.risk_indicators.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-red-300">
                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>
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

function Section({ 
  title, 
  color, 
  children 
}: { 
  title: string; 
  color: string; 
  children: React.ReactNode;
}) {
  const borderColors: Record<string, string> = {
    purple: "border-l-purple-500",
    blue: "border-l-blue-500",
    emerald: "border-l-emerald-500",
    violet: "border-l-violet-500",
    cyan: "border-l-cyan-500",
    amber: "border-l-amber-500",
    red: "border-l-red-500",
  };

  return (
    <div className={`border-l-2 ${borderColors[color]} pl-4`}>
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

