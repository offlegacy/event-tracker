import {
  AnySchemas,
  UnknownContext,
  UnknownEventParams,
  UnionPropsWithAndWithoutSchema,
  PropsWithSchema,
} from "../tracker/types";

export const isEventPropsWithSchema = <
  T extends keyof Schemas,
  Schemas extends AnySchemas = AnySchemas,
  EventParams extends UnknownEventParams = UnknownEventParams,
  Context extends UnknownContext = UnknownContext,
>(
  props: UnionPropsWithAndWithoutSchema<T, Schemas, EventParams, Context>,
): props is PropsWithSchema<T, Schemas, Context> => {
  return "schema" in props && props.schema !== undefined;
};
