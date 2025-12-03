import { describe, it, expect } from "vitest";
import { scanTranscriptForRisk, getRiskLevel } from "../lib/riskScanner";

describe("scanTranscriptForRisk", () => {
  it("detects no risk in safe transcript", () => {
    const safeTranscript = `
      THERAPIST: How have you been feeling this week?
      CLIENT: Better, actually. The breathing exercises have been helping.
      THERAPIST: That's wonderful to hear. What else has been going well?
      CLIENT: I've been sleeping better and feeling more motivated at work.
    `;

    const result = scanTranscriptForRisk(safeTranscript);
    expect(result.hasCrisisLanguage).toBe(false);
    expect(result.keywords).toHaveLength(0);
    expect(result.excerpts).toHaveLength(0);
  });

  it("detects suicidal ideation keywords", () => {
    const riskyTranscript = `
      THERAPIST: How have you been feeling this week?
      CLIENT: Not great. Sometimes I feel like I don't want to live anymore.
      THERAPIST: I hear that you're going through a really difficult time.
    `;

    const result = scanTranscriptForRisk(riskyTranscript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords).toContain("don't want to live");
    expect(result.excerpts.length).toBeGreaterThan(0);
  });

  it("detects self-harm language", () => {
    const transcript = `
      CLIENT: I've been having thoughts about ways to hurt myself lately.
      THERAPIST: Thank you for sharing that with me. Can you tell me more?
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords).toContain("hurt myself");
  });

  it("detects suicide-related keywords", () => {
    const transcript = `
      CLIENT: I've been having suicidal thoughts lately.
      THERAPIST: I'm glad you felt safe enough to tell me.
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords).toContain("suicidal");
  });

  it("detects harm to others language", () => {
    const transcript = `
      CLIENT: Sometimes I get so angry I want to hurt someone.
      THERAPIST: Let's talk about managing those feelings.
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords).toContain("hurt someone");
  });

  it("is case-insensitive", () => {
    const transcript = "CLIENT: I've been thinking about SUICIDE lately.";
    
    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords).toContain("suicide");
  });

  it("captures excerpts around keywords", () => {
    const transcript = `
      This is some context before. I want to kill myself. This is context after.
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.excerpts.length).toBeGreaterThan(0);
    expect(result.excerpts[0]).toContain("kill myself");
  });

  it("removes duplicate keywords", () => {
    const transcript = `
      CLIENT: I feel suicidal. I've felt suicidal for weeks.
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.keywords.filter(k => k === "suicidal").length).toBe(1);
  });

  it("detects multiple different keywords", () => {
    const transcript = `
      CLIENT: I've been having suicidal thoughts and I want to hurt myself.
    `;

    const result = scanTranscriptForRisk(transcript);
    expect(result.hasCrisisLanguage).toBe(true);
    expect(result.keywords.length).toBeGreaterThan(1);
    expect(result.keywords).toContain("suicidal");
    expect(result.keywords).toContain("hurt myself");
  });

  it("handles empty transcript", () => {
    const result = scanTranscriptForRisk("");
    expect(result.hasCrisisLanguage).toBe(false);
    expect(result.keywords).toHaveLength(0);
  });
});

describe("getRiskLevel", () => {
  it("returns 'none' for no crisis language", () => {
    const result = {
      hasCrisisLanguage: false,
      keywords: [],
      excerpts: [],
    };

    expect(getRiskLevel(result)).toBe("none");
  });

  it("returns 'high' for suicidal keywords", () => {
    const result = {
      hasCrisisLanguage: true,
      keywords: ["kill myself"],
      excerpts: ["...I want to kill myself..."],
    };

    expect(getRiskLevel(result)).toBe("high");
  });

  it("returns 'high' for suicide keyword", () => {
    const result = {
      hasCrisisLanguage: true,
      keywords: ["suicide"],
      excerpts: ["...thinking about suicide..."],
    };

    expect(getRiskLevel(result)).toBe("high");
  });

  it("returns 'low' for self-harm without suicidal intent", () => {
    const result = {
      hasCrisisLanguage: true,
      keywords: ["hurt myself"],
      excerpts: ["...thoughts about hurting myself..."],
    };

    expect(getRiskLevel(result)).toBe("low");
  });

  it("returns 'high' if any high-risk keyword is present", () => {
    const result = {
      hasCrisisLanguage: true,
      keywords: ["hurt myself", "want to die"],
      excerpts: [],
    };

    expect(getRiskLevel(result)).toBe("high");
  });
});
