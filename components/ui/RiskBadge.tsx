"use client";

interface RiskBadgeProps {
  hasCrisisLanguage: boolean;
  keywords?: string[];
}

export default function RiskBadge({ hasCrisisLanguage, keywords = [] }: RiskBadgeProps) {
  if (!hasCrisisLanguage) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>Possible crisis language</span>
      {keywords.length > 0 && (
        <span className="text-amber-600">({keywords.length} flags)</span>
      )}
    </div>
  );
}

