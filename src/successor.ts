import { isDeepStrictEqual } from "node:util";
import {
  sortFindings,
  sortUniqueStrings,
  type Finding,
  type Result,
} from "./model.js";

export type SuccessorDisposition = "admitted" | "refused" | "failed" | "no-op";

export interface SuccessorReceiptV01 {
  schema: "iron-lung/successor-receipt/v0.1";
  receiptId: string;
  eventId: string;
  eventKind: string;
  disposition: SuccessorDisposition;
  priorCutId: string;
  nextCutId: string;
  ordinalBefore: number;
  ordinalAfter: number;
  bodyChanged: boolean;
  refs: string[];
}

export interface SuccessorCutV01<T> {
  schema: "iron-lung/successor-cut/v0.1";
  cutId: string;
  parentCutId?: string;
  ordinal: number;
  body: T;
  receiptIds: string[];
  eventIds: string[];
}

export interface SuccessorTransitionV01<T> {
  cut: SuccessorCutV01<T>;
  receipt: SuccessorReceiptV01;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonEmptyString);
}

function invalid(detail: string, refs: string[] = []): Finding {
  return { code: "invalid_successor", detail, refs };
}

function duplicate(detail: string, refs: string[] = []): Finding {
  return { code: "duplicate_successor_event", detail, refs };
}

function validDisposition(value: unknown): value is SuccessorDisposition {
  return value === "admitted" || value === "refused" || value === "failed" || value === "no-op";
}

function validatePrior<T>(prior: SuccessorCutV01<T>): Finding[] {
  const findings: Finding[] = [];
  if (!prior || typeof prior !== "object") return [invalid("prior cut must be an object")];
  if (prior.schema !== "iron-lung/successor-cut/v0.1") findings.push(invalid("unsupported successor cut schema"));
  if (!nonEmptyString(prior.cutId)) findings.push(invalid("prior cut id must be non-empty"));
  if (prior.parentCutId !== undefined && !nonEmptyString(prior.parentCutId)) {
    findings.push(invalid("parent cut id must be non-empty when present"));
  }
  if (!Number.isInteger(prior.ordinal) || prior.ordinal < 0) findings.push(invalid("prior ordinal must be a non-negative integer"));
  if (!validStringArray(prior.receiptIds)) findings.push(invalid("prior receiptIds must be an array of non-empty ids"));
  if (!validStringArray(prior.eventIds)) findings.push(invalid("prior eventIds must be an array of non-empty ids"));
  if (validStringArray(prior.receiptIds) && new Set(prior.receiptIds).size !== prior.receiptIds.length) {
    findings.push(duplicate("prior cut contains duplicate receipt ids", prior.receiptIds));
  }
  if (validStringArray(prior.eventIds) && new Set(prior.eventIds).size !== prior.eventIds.length) {
    findings.push(duplicate("prior cut contains duplicate event ids", prior.eventIds));
  }
  if (validStringArray(prior.receiptIds) && Number.isInteger(prior.ordinal) && prior.receiptIds.length !== prior.ordinal) {
    findings.push(invalid("prior receipt depth must equal ordinal", [prior.cutId]));
  }
  if (validStringArray(prior.eventIds) && Number.isInteger(prior.ordinal) && prior.eventIds.length !== prior.ordinal) {
    findings.push(invalid("prior event depth must equal ordinal", [prior.cutId]));
  }
  return findings;
}

export function createInitialCut<T>(cutId: string, body: T): Result<SuccessorCutV01<T>> {
  if (!nonEmptyString(cutId)) {
    return { ok: false, findings: [invalid("initial cut id must be non-empty")] };
  }
  return {
    ok: true,
    value: {
      schema: "iron-lung/successor-cut/v0.1",
      cutId,
      ordinal: 0,
      body: structuredClone(body),
      receiptIds: [],
      eventIds: [],
    },
    findings: [],
  };
}

export function applySuccessor<T>(input: {
  prior: SuccessorCutV01<T>;
  nextCutId: string;
  receiptId: string;
  eventId: string;
  eventKind: string;
  disposition: SuccessorDisposition;
  nextBody: T;
  refs?: string[];
}): Result<SuccessorTransitionV01<T>> {
  const findings = validatePrior(input.prior);

  if (!nonEmptyString(input.nextCutId)) findings.push(invalid("next cut id must be non-empty"));
  if (!nonEmptyString(input.receiptId)) findings.push(invalid("receipt id must be non-empty"));
  if (!nonEmptyString(input.eventId)) findings.push(invalid("event id must be non-empty"));
  if (!nonEmptyString(input.eventKind)) findings.push(invalid("event kind must be non-empty"));
  if (!validDisposition(input.disposition)) findings.push(invalid("successor disposition is invalid"));
  if (input.refs !== undefined && !validStringArray(input.refs)) findings.push(invalid("refs must contain only non-empty strings"));

  if (nonEmptyString(input.nextCutId) && input.nextCutId === input.prior.cutId) {
    findings.push(invalid("successor must create a fresh cut id", [input.nextCutId]));
  }
  if (nonEmptyString(input.eventId) && input.prior.eventIds.includes(input.eventId)) {
    findings.push(duplicate("event id already exists in prior history", [input.eventId]));
  }
  if (nonEmptyString(input.receiptId) && input.prior.receiptIds.includes(input.receiptId)) {
    findings.push(duplicate("receipt id already exists in prior history", [input.receiptId]));
  }

  if (findings.length > 0) return { ok: false, findings: sortFindings(findings) };

  const ordinalAfter = input.prior.ordinal + 1;
  const nextBody = structuredClone(input.nextBody);
  const receipt: SuccessorReceiptV01 = {
    schema: "iron-lung/successor-receipt/v0.1",
    receiptId: input.receiptId,
    eventId: input.eventId,
    eventKind: input.eventKind,
    disposition: input.disposition,
    priorCutId: input.prior.cutId,
    nextCutId: input.nextCutId,
    ordinalBefore: input.prior.ordinal,
    ordinalAfter,
    bodyChanged: !isDeepStrictEqual(input.prior.body, nextBody),
    refs: sortUniqueStrings(input.refs ?? []),
  };
  const cut: SuccessorCutV01<T> = {
    schema: "iron-lung/successor-cut/v0.1",
    cutId: input.nextCutId,
    parentCutId: input.prior.cutId,
    ordinal: ordinalAfter,
    body: nextBody,
    receiptIds: [...input.prior.receiptIds, input.receiptId],
    eventIds: [...input.prior.eventIds, input.eventId],
  };

  return { ok: true, value: { cut, receipt }, findings: [] };
}

export function sameBody<T>(a: SuccessorCutV01<T>, b: SuccessorCutV01<T>): boolean {
  return isDeepStrictEqual(a.body, b.body);
}
