import type { TreatmentPlanJson } from "./plan";

export const CLIENT_PLAN_SYSTEM = `
You are rewriting a mental health treatment plan for a client to read.
The input is a JSON object with structured clinical information.
You must output JSON with the EXACT SAME KEYS, but rewrite all values in
warm, plain, encouraging language at an 8th-grade reading level.

Rules:
- Keep all arrays the same length.
- Keep the overall meaning but avoid medical jargon.
- Emphasize strengths, progress, and actionable next steps.
- Do not add risk indicators unless present in the input JSON.
- Use "you" and "your" to address the client directly.
- Frame challenges as opportunities for growth.
- Be supportive and validating without being patronizing.
`;

export function buildClientPlanUserPrompt(therapistPlanJson: TreatmentPlanJson): string {
  return `Here is the therapist-facing treatment plan JSON:

${JSON.stringify(therapistPlanJson, null, 2)}

Rewrite it for the client following the rules above.`;
}

export interface ClientPlanJson {
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
}

