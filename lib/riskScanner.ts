export interface RiskScanResult {
  hasCrisisLanguage: boolean;
  keywords: string[];
  excerpts: string[];
}

const CRISIS_KEYWORDS = [
  "kill myself",
  "end my life",
  "suicidal",
  "suicide",
  "self-harm",
  "hurt myself",
  "hurt someone",
  "harm others",
  "don't want to live",
  "want to die",
  "better off dead",
  "no reason to live",
  "can't go on",
  "end it all",
];

export function scanTranscriptForRisk(transcript: string): RiskScanResult {
  const lower = transcript.toLowerCase();
  const foundKeywords: string[] = [];
  const excerpts: string[] = [];

  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw)) {
      foundKeywords.push(kw);
      // Grab a small excerpt around the keyword for context
      const idx = lower.indexOf(kw);
      const start = Math.max(0, idx - 80);
      const end = Math.min(transcript.length, idx + kw.length + 80);
      const excerpt = transcript.slice(start, end);
      
      // Avoid duplicate excerpts for overlapping keywords
      if (!excerpts.some(e => e.includes(excerpt) || excerpt.includes(e))) {
        excerpts.push(excerpt);
      }
    }
  }

  return {
    hasCrisisLanguage: foundKeywords.length > 0,
    keywords: [...new Set(foundKeywords)], // Remove duplicates
    excerpts,
  };
}

export function getRiskLevel(result: RiskScanResult): "none" | "low" | "high" {
  if (!result.hasCrisisLanguage) return "none";
  
  const highRiskKeywords = ["kill myself", "end my life", "suicide", "suicidal", "want to die"];
  const hasHighRisk = result.keywords.some(kw => highRiskKeywords.includes(kw));
  
  return hasHighRisk ? "high" : "low";
}

