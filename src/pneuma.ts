import { sortFindings, sortUniqueStrings, type Finding, type Result } from "./model.js";

export interface PneumaAnnotationV01 {
  schema: "iron-lung/pneuma/v0.1";
  braidId: string;
  status: "interpretive";
  hypothesis: string;
  questions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validatePneumaAnnotation(input: unknown): Result<PneumaAnnotationV01> {
  const findings: Finding[] = [];
  if (!isRecord(input)) {
    return {
      ok: false,
      findings: [{ code: "invalid_pneuma_annotation", detail: "pneuma annotation must be an object", refs: [] }],
    };
  }

  const exactKeys = ["braidId", "hypothesis", "questions", "schema", "status"];
  if (Object.keys(input).sort().join(",") !== exactKeys.join(",")) {
    findings.push({ code: "invalid_pneuma_annotation", detail: "pneuma annotation has invalid top-level fields", refs: [] });
  }
  if (input.schema !== "iron-lung/pneuma/v0.1") {
    findings.push({ code: "invalid_pneuma_annotation", detail: "unsupported pneuma schema", refs: [] });
  }
  if (!nonEmptyString(input.braidId)) {
    findings.push({ code: "invalid_pneuma_annotation", detail: "pneuma braidId must be non-empty", refs: [] });
  }
  if (input.status !== "interpretive") {
    findings.push({ code: "invalid_pneuma_annotation", detail: "pneuma status must remain interpretive", refs: [] });
  }
  if (!nonEmptyString(input.hypothesis)) {
    findings.push({ code: "invalid_pneuma_annotation", detail: "pneuma hypothesis must be non-empty", refs: [] });
  }
  if (!Array.isArray(input.questions) || !input.questions.every(nonEmptyString)) {
    findings.push({ code: "invalid_pneuma_annotation", detail: "pneuma questions must be non-empty strings", refs: [] });
  }

  if (findings.length > 0 || !nonEmptyString(input.braidId) || !nonEmptyString(input.hypothesis) || !Array.isArray(input.questions)) {
    return { ok: false, findings: sortFindings(findings) };
  }

  return {
    ok: true,
    value: {
      schema: "iron-lung/pneuma/v0.1",
      braidId: input.braidId,
      status: "interpretive",
      hypothesis: input.hypothesis,
      questions: sortUniqueStrings(input.questions as string[]),
    },
    findings: [],
  };
}
