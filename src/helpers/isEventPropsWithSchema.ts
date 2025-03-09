import type { Context, EventParams, Schemas, UnionPropsWithAndWithoutSchema, PropsWithSchema } from "../types";

export const isEventPropsWithSchema = <
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TKey extends keyof TSchemas = keyof TSchemas,
>(
  props: UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>,
): props is PropsWithSchema<TContext, TSchemas, TKey> => {
  return "schema" in props && props.schema !== undefined;
};
