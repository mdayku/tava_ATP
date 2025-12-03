export interface TreatmentPlanJson {
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

export const PLAN_SYSTEM = `
You are a licensed mental health clinician writing structured treatment plans
based on a therapy session transcript. You produce clinically sound, structured
outputs that other clinicians could use as a starting point.

You must respond ONLY with valid JSON matching this schema:

{
  "presenting_concerns": "string",
  "clinical_impressions": "string",
  "goals": {
    "short_term": ["string"],
    "long_term": ["string"]
  },
  "interventions": ["string"],
  "homework": ["string"],
  "strengths": ["string"],
  "risk_indicators": ["string"]
}

Guidelines:
- Use professional clinical language.
- Be specific and behaviorally anchored.
- Only include risk indicators if the transcript supports them.
- If a field is not applicable, use an empty string ("") or empty array ([]).
- Do NOT include any extra keys.
`;

export interface PreviousPlan {
  sessionNumber: number;
  date: string;
  presenting_concerns: string;
  goals: {
    short_term: string[];
    long_term: string[];
  };
  interventions: string[];
  homework: string[];
  strengths: string[];
  risk_indicators: string[];
}

export function buildPlanUserPrompt(transcript: string, previousPlan?: PreviousPlan): string {
  let prompt = "";
  
  if (previousPlan) {
    prompt = `PREVIOUS TREATMENT PLAN (from Session #${previousPlan.sessionNumber}, ${previousPlan.date}):
${JSON.stringify(previousPlan, null, 2)}

IMPORTANT: This is an UPDATE to the existing treatment plan. You should:
1. Maintain continuity with the previous plan's goals and interventions
2. Update goals based on progress discussed in the session
3. Mark completed goals or add new ones as appropriate
4. Evolve the presenting concerns based on new information
5. Update homework based on what was assigned this session
6. Add any new strengths identified
7. Update risk indicators based on current assessment

---

`;
  }
  
  prompt += `Transcript:
${transcript}

Generate a structured treatment plan JSON now.${previousPlan ? ' This should be an evolved version of the previous plan, reflecting progress and new insights from this session.' : ''}`;
  
  return prompt;
}
