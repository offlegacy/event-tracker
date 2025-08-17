import type { StandardSchemaV1 } from "../types";

function isIssue(x: unknown): x is StandardSchemaV1.Issue {
  return !!x && typeof (x as any).message === "string";
}

export function isFailureResult(e: unknown): e is StandardSchemaV1.FailureResult {
  return (
    !!e &&
    typeof e === "object" &&
    "issues" in (e as any) &&
    Array.isArray((e as any).issues) &&
    (e as any).issues.every(isIssue)
  );
}
