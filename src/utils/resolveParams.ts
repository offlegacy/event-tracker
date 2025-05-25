import { isEventPropsWithSchema } from "../helpers/isEventPropsWithSchema";
import { isFunction } from "../helpers/isFunction";
import type { Context, EventParams, Schemas, SchemaParams, UnionPropsWithAndWithoutSchema } from "../types";

/**
 * Resolves parameters from props to actual values.
 * Handles both cases with and without schema,
 * and executes functions by passing the current context.
 */
export function resolveParams<
  TContext extends Context,
  TEventParams extends EventParams,
  TSchemas extends Schemas,
  TKey extends keyof TSchemas,
>(
  props: UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>,
  getContext: () => TContext,
): TEventParams | SchemaParams<TSchemas, TKey> {
  if (isEventPropsWithSchema(props)) {
    return isFunction<TContext, SchemaParams<TSchemas, TKey>>(props.params) ? props.params(getContext()) : props.params;
  } else {
    return isFunction<TContext, TEventParams>(props.params) ? props.params(getContext()) : props.params;
  }
}
