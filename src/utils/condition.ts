import type { Context, EventParams, EnabledCondition } from "../types";

/**
 * Evaluates the enabled condition for event tracking
 *
 * @param enabled - The enabled condition (boolean or function)
 * @param context - The current context
 * @param params - The event parameters
 * @returns boolean indicating whether tracking should be executed
 */
export function evaluateEnabledCondition<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
>(enabled: EnabledCondition<TContext, TEventParams> | undefined, context: TContext, params: TEventParams): boolean {
  // Default to true if enabled is not specified
  if (enabled === undefined) return true;

  // Handle boolean values
  if (typeof enabled === "boolean") return enabled;

  // Handle function values
  if (typeof enabled === "function") {
    try {
      return enabled(context, params);
    } catch (error) {
      console.warn("Enabled condition evaluation failed:", error);
      return false; // Fail safe - don't track on error
    }
  }

  // Fallback to true for any other cases
  return true;
}
