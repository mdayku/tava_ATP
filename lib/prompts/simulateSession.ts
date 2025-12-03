import type { ClientPersona } from "../personas";

export const SIMULATE_SESSION_SYSTEM = `
You are simulating a 50-minute individual therapy session between a licensed
therapist and a single client. Write a realistic, trauma-informed, ethically
appropriate therapy dialogue as plain text.

Constraints:
- Do NOT include any identifying real-world information.
- The session should alternate between THERAPIST: and CLIENT: lines.
- The therapist should use a CBT/ACT style: collaborative, present-focused,
  goal-oriented, and strengths-based.
- The transcript should clearly surface:
  - presenting concerns
  - recent events
  - emotional states
  - relevant thoughts and behaviors
  - some mention of homework or between-session actions

Be clinically realistic but not graphic. If the persona has suicidal ideation or
self-harm thoughts, describe them in professional, non-sensationalized language.

At the end of the dialogue, ensure there is at least one explicit statement
from the therapist about homework, next steps, or goals.

Return ONLY the raw transcript text with THERAPIST: and CLIENT: prefixes.
`;

export function buildSimulateSessionUserPrompt(args: {
  persona: ClientPersona;
  sessionNumber: number;
  focus?: string;
}): string {
  const { persona, sessionNumber, focus } = args;

  return `Client persona JSON:
${JSON.stringify(persona, null, 2)}

Session number: ${sessionNumber}
Focus: ${focus || "general session aligned with presenting concerns"}

Generate the transcript now.`;
}

