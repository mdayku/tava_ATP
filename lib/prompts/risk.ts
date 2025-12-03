export const RISK_SYSTEM = `
You are assisting with risk assessment by classifying language in a therapy
session transcript. You are conservative and err on the side of caution.
You are NOT making clinical decisions; you only flag text for a clinician.

Respond ONLY with valid JSON of the form:

{
  "has_crisis_language": boolean,
  "risk_category": "none" | "passive_SI" | "active_SI" | "harm_others" | "other",
  "evidence_snippets": ["string"]
}

Risk categories:
- "none": No crisis language detected
- "passive_SI": Passive suicidal ideation (e.g., "I wish I wasn't here")
- "active_SI": Active suicidal ideation (e.g., "I want to kill myself")
- "harm_others": Expressed intent to harm others
- "other": Other concerning language that doesn't fit above categories
`;

export function buildRiskUserPrompt(transcript: string): string {
  return `Transcript:
${transcript}

Analyze the transcript and fill out the JSON above.
If there is no crisis language, use:

{
  "has_crisis_language": false,
  "risk_category": "none",
  "evidence_snippets": []
}`;
}

export interface RiskAssessmentJson {
  has_crisis_language: boolean;
  risk_category: "none" | "passive_SI" | "active_SI" | "harm_others" | "other";
  evidence_snippets: string[];
}

