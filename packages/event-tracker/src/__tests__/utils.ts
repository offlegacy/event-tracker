import { StandardSchemaV1 } from "..";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const anyFn = expect.any(Function);

// Standard Schema compliant schema definition
export function createSchema<T>(validator: (value: unknown) => T): StandardSchemaV1<unknown, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "custom",
      validate: (value: unknown) => {
        try {
          const result = validator(value);
          return { value: result };
        } catch (error) {
          return {
            issues: [{ message: error instanceof Error ? error.message : "Validation failed" }],
          };
        }
      },
    },
  };
}

// Type guard functions
export const isString = (value: unknown): value is string => typeof value === "string";
export const isNumber = (value: unknown): value is number => typeof value === "number";
export const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
