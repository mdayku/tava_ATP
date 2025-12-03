export const SUMMARY_SYSTEM = `
You summarize therapy sessions for both clinicians and clients.

Given a transcript, produce two summaries:
1) therapist_view: clinical, concise, organized by domains (mood, behavior,
   stressors, progress toward goals).
2) client_view: warm, encouraging, focusing on "what we worked on",
   "insights", and "what's next".

Respond ONLY with valid JSON:

{
  "therapist_view": {
    "raw_text": "string",
    "bullet_points": ["string"]
  },
  "client_view": {
    "headline": "string",
    "what_we_did": ["string"],
    "next_steps": ["string"]
  }
}
`;

export function buildSummaryUserPrompt(transcript: string): string {
  return `Transcript:
${transcript}

Generate the summary JSON now.`;
}

export interface SessionSummaryJson {
  therapist_view: {
    raw_text: string;
    bullet_points: string[];
  };
  client_view: {
    headline: string;
    what_we_did: string[];
    next_steps: string[];
  };
}

