import { isEventPropsWithSchema } from "../helpers/isEventPropsWithSchema";
import { isFunction } from "../helpers/isFunction";
import type { Context, EventParams, Schemas, SchemaParams, UnionPropsWithAndWithoutSchema } from "../types";

/**
 * props에서 params를 해석하여 실제 값을 반환합니다.
 * 스키마가 있는 경우와 없는 경우를 모두 처리하며,
 * 함수인 경우 현재 context를 전달하여 실행합니다.
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
