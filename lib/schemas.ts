import { z } from "zod";

// Treatment Plan Schema
export const TreatmentPlanSchema = z.object({
  presenting_concerns: z.string(),
  clinical_impressions: z.string(),
  goals: z.object({
    short_term: z.array(z.string()),
    long_term: z.array(z.string()),
  }),
  interventions: z.array(z.string()),
  homework: z.array(z.string()),
  strengths: z.array(z.string()),
  risk_indicators: z.array(z.string()),
});

export type TreatmentPlan = z.infer<typeof TreatmentPlanSchema>;

// Session Summary Schema
export const SessionSummarySchema = z.object({
  therapist_view: z.object({
    raw_text: z.string(),
    bullet_points: z.array(z.string()),
  }),
  client_view: z.object({
    headline: z.string(),
    what_we_did: z.array(z.string()),
    next_steps: z.array(z.string()),
  }),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// Risk Assessment Schema
export const RiskAssessmentSchema = z.object({
  has_crisis_language: z.boolean(),
  risk_category: z.enum(["none", "passive_SI", "active_SI", "harm_others", "other"]),
  evidence_snippets: z.array(z.string()),
});

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

// Risk Scan Result Schema
export const RiskScanResultSchema = z.object({
  hasCrisisLanguage: z.boolean(),
  keywords: z.array(z.string()),
  excerpts: z.array(z.string()),
});

export type RiskScanResult = z.infer<typeof RiskScanResultSchema>;

// Validation functions
export function validateTreatmentPlan(data: unknown): TreatmentPlan {
  return TreatmentPlanSchema.parse(data);
}

export function validateSessionSummary(data: unknown): SessionSummary {
  return SessionSummarySchema.parse(data);
}

export function validateRiskAssessment(data: unknown): RiskAssessment {
  return RiskAssessmentSchema.parse(data);
}

export function safeParseTreatmentPlan(data: unknown) {
  return TreatmentPlanSchema.safeParse(data);
}

export function safeParseSessionSummary(data: unknown) {
  return SessionSummarySchema.safeParse(data);
}

export function safeParseRiskAssessment(data: unknown) {
  return RiskAssessmentSchema.safeParse(data);
}

