import type { DOMAttributes } from "react";
import type { BatchConfig } from "../scheduler/types";
import { type z } from "zod";

export type UnknownContext = Record<string, unknown>;
export type UnknownEventParams = Record<string, unknown>;
export type AnySchemas = Record<string, z.ZodObject<any>>;

export type SchemaParams<Schemas extends AnySchemas = AnySchemas, T extends keyof Schemas = keyof Schemas> = z.infer<
  Schemas[T]
>;

export interface ImpressionOptions {
  /**
   * A threshold indicating the percentage of the target's visibility needed to trigger the callback
   * @default 0.2
   */
  threshold?: number;
  /**
   * If true, freezes the intersection state once the element becomes visible.
   * @default true
   */
  freezeOnceVisible?: boolean;
  /**
   * The initial state of the intersection.
   * @default false
   */
  initialIsIntersecting?: boolean;
}
export interface PageViewOptions {
  // TODO: add options
}

export type SetContext<C = unknown> = (context: C | ((prevContext: C) => C)) => void;

export type TaskReturnType<T = any> = void | EventResult<T> | Promise<void | EventResult<T>>;
export type Task<T = any> = (...args: any) => TaskReturnType<T>;

type InitFunction<C> = (initialContext: C, setContext: SetContext<C>) => void | Promise<void>;

export type DOMEventNames = keyof Omit<DOMAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">;
export type DOMEvents<P, C> = Partial<Record<DOMEventNames, EventFunction<P, C>>>;

type EventFunction<P, C> = (params: P, context: C, setContext: SetContext<C>) => TaskReturnType;

export type EventResult<T = any> = Record<string, T>;

export type EventNames = "onImpression" | "onPageView" | DOMEventNames;

export type EventParamsWithContext<EventParams, Context> = EventParams | ((context: Context) => EventParams);

export type EventParamsWithSchema<
  Schemas extends AnySchemas = AnySchemas,
  T extends keyof Schemas = keyof Schemas,
  Context extends UnknownContext = UnknownContext,
> = {
  schema: T;
  params: ((context: Context) => SchemaParams<Schemas, T>) | SchemaParams<Schemas, T>;
};

export type SchemaConfig<Schemas extends AnySchemas> = {
  schemas: Schemas;
  onSchemaError?: (error: z.ZodError) => void;
  abortOnError?: boolean;
};

export type UnionPropsWithAndWithoutSchema<
  T extends keyof Schemas,
  Schemas extends AnySchemas = AnySchemas,
  EventParams extends UnknownEventParams = UnknownEventParams,
  Context extends UnknownContext = UnknownContext,
> = PropsWithSchema<T, Schemas, Context> | PropsWithoutSchema<EventParams, Context>;

export type PropsWithSchema<
  T extends keyof Schemas,
  Schemas extends AnySchemas = AnySchemas,
  Context extends UnknownContext = UnknownContext,
> = {
  schema: T;
  params: ((context: Context) => SchemaParams<Schemas, T>) | SchemaParams<Schemas, T>;
};

export type PropsWithoutSchema<
  EventParams extends UnknownEventParams = UnknownEventParams,
  Context extends UnknownContext = UnknownContext,
> = {
  schema?: undefined;
  params: EventParamsWithContext<EventParams, Context>;
};

export interface TrackerConfig<Context, EventParams, Schemas extends AnySchemas> {
  /**
   * Initialize the tracker with the given context.
   * @param initialContext - The initial context to use for the tracker.
   * @returns void
   */
  readonly init?: InitFunction<Context>;
  /**
   * The send function to send the event.
   * @param params - The custom params to send.
   * @param context - The context to send.
   * @returns void
   */
  readonly send?: EventFunction<EventParams | SchemaParams<Schemas, keyof Schemas>, Context>;
  /**
   * The events to listen to.
   */
  readonly DOMEvents?: DOMEvents<EventParams | SchemaParams<Schemas, keyof Schemas>, Context>;
  /**
   * The impression event to listen to.
   */
  impression?: {
    onImpression: EventFunction<EventParams | SchemaParams<Schemas, keyof Schemas>, Context>;
    options?: ImpressionOptions;
  };
  /**
   * The page track event to listen to.
   */
  pageView?: {
    onPageView: EventFunction<EventParams | SchemaParams<Schemas, keyof Schemas>, Context>;
    /**
     * TODO: add options
     */
    // options?: PageViewOptions;
  };
  batch?: BatchConfig;
  schema?: SchemaConfig<Schemas>;
}

export interface TrackerContextProps<Context, EventParams, Schemas extends AnySchemas> {
  tracker: TrackerConfig<Context, EventParams, Schemas>;
  _setContext: (context: Context | ((prevContext: Context) => Context)) => void;
  _getContext: () => Context;
  _schedule: (task: Task) => Promise<void>;
}
