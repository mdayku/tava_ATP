import { describe, it, expect } from "vitest";
import {
  TreatmentPlanSchema,
  SessionSummarySchema,
  RiskAssessmentSchema,
  validateTreatmentPlan,
  validateSessionSummary,
  validateRiskAssessment,
  safeParseTreatmentPlan,
} from "../lib/schemas";

describe("TreatmentPlanSchema", () => {
  it("validates a complete treatment plan", () => {
    const validPlan = {
      presenting_concerns: "Client reports ongoing anxiety and sleep issues.",
      clinical_impressions: "Consistent with generalized anxiety disorder.",
      goals: {
        short_term: ["Practice breathing exercise 3x/week."],
        long_term: ["Reduce anxiety severity by 50% over 3 months."],
      },
      interventions: ["CBT psychoeducation on anxiety cycle"],
      homework: ["Record worry episodes in a log each evening."],
      strengths: ["Motivated to change", "Supportive partner"],
      risk_indicators: [],
    };

    const result = TreatmentPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.goals.short_term.length).toBeGreaterThan(0);
      expect(result.data.presenting_concerns).toContain("anxiety");
    }
  });

  it("validates a plan with risk indicators", () => {
    const planWithRisk = {
      presenting_concerns: "Client reports depression with passive suicidal ideation.",
      clinical_impressions: "Major depressive disorder, moderate severity.",
      goals: {
        short_term: ["Establish safety plan"],
        long_term: ["Improve mood and reduce depressive symptoms"],
      },
      interventions: ["Safety planning", "CBT for depression"],
      homework: ["Complete daily mood log"],
      strengths: ["Engaged in treatment", "Has social support"],
      risk_indicators: ["Passive suicidal ideation expressed"],
    };

    const result = validateTreatmentPlan(planWithRisk);
    expect(result.risk_indicators.length).toBeGreaterThan(0);
  });

  it("rejects invalid plan structure", () => {
    const invalidPlan = {
      presenting_concerns: "Some concerns",
      // Missing required fields
    };

    const result = safeParseTreatmentPlan(invalidPlan);
    expect(result.success).toBe(false);
  });

  it("rejects plan with wrong types", () => {
    const wrongTypes = {
      presenting_concerns: 123, // Should be string
      clinical_impressions: "Valid",
      goals: {
        short_term: "Not an array", // Should be array
        long_term: [],
      },
      interventions: [],
      homework: [],
      strengths: [],
      risk_indicators: [],
    };

    const result = safeParseTreatmentPlan(wrongTypes);
    expect(result.success).toBe(false);
  });

  it("accepts empty arrays for optional fields", () => {
    const minimalPlan = {
      presenting_concerns: "",
      clinical_impressions: "",
      goals: {
        short_term: [],
        long_term: [],
      },
      interventions: [],
      homework: [],
      strengths: [],
      risk_indicators: [],
    };

    const result = safeParseTreatmentPlan(minimalPlan);
    expect(result.success).toBe(true);
  });
});

describe("SessionSummarySchema", () => {
  it("validates a complete session summary", () => {
    const validSummary = {
      therapist_view: {
        raw_text: "Client presented with elevated anxiety...",
        bullet_points: [
          "Discussed anxiety triggers",
          "Introduced grounding techniques",
          "Assigned homework",
        ],
      },
      client_view: {
        headline: "Working on Managing Worry",
        what_we_did: [
          "Talked about what's been making you anxious lately",
          "Learned a new breathing exercise",
        ],
        next_steps: [
          "Practice the 4-7-8 breathing when feeling anxious",
          "Keep a worry journal this week",
        ],
      },
    };

    const result = SessionSummarySchema.safeParse(validSummary);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.therapist_view.bullet_points.length).toBe(3);
      expect(result.data.client_view.what_we_did.length).toBe(2);
    }
  });

  it("rejects summary missing therapist view", () => {
    const invalidSummary = {
      client_view: {
        headline: "Test",
        what_we_did: [],
        next_steps: [],
      },
    };

    const result = SessionSummarySchema.safeParse(invalidSummary);
    expect(result.success).toBe(false);
  });
});

describe("RiskAssessmentSchema", () => {
  it("validates a no-risk assessment", () => {
    const noRisk = {
      has_crisis_language: false,
      risk_category: "none" as const,
      evidence_snippets: [],
    };

    const result = validateRiskAssessment(noRisk);
    expect(result.has_crisis_language).toBe(false);
    expect(result.risk_category).toBe("none");
  });

  it("validates an assessment with crisis language", () => {
    const withRisk = {
      has_crisis_language: true,
      risk_category: "passive_SI" as const,
      evidence_snippets: [
        "...sometimes I just don't want to be here anymore...",
      ],
    };

    const result = validateRiskAssessment(withRisk);
    expect(result.has_crisis_language).toBe(true);
    expect(result.risk_category).toBe("passive_SI");
    expect(result.evidence_snippets.length).toBe(1);
  });

  it("rejects invalid risk category", () => {
    const invalidCategory = {
      has_crisis_language: true,
      risk_category: "invalid_category",
      evidence_snippets: [],
    };

    const result = RiskAssessmentSchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it("accepts all valid risk categories", () => {
    const categories = ["none", "passive_SI", "active_SI", "harm_others", "other"] as const;

    for (const category of categories) {
      const assessment = {
        has_crisis_language: category !== "none",
        risk_category: category,
        evidence_snippets: [],
      };

      const result = RiskAssessmentSchema.safeParse(assessment);
      expect(result.success).toBe(true);
    }
  });
});

