import { BatchConfig } from ".";
import { DOMAttributes } from "react";
import type { DebounceConfig } from "./utils/debounce";
import type { ThrottleConfig } from "./utils/throttle";

/** Context */
export type Context = Record<string, any>;
export type SetContext<TContext extends Context = Context> = (
  context: (prev: TContext) => TContext | TContext,
) => void | Promise<void>;

/** Event Names */
export type EventNames = "onImpression" | "onPageView" | DOMEventNames;

/** EventParams */
export type SchemaParams<
  TSchemas extends Schemas = Schemas,
  TKey extends keyof TSchemas = keyof TSchemas,
> = StandardSchemaV1.InferOutput<TSchemas[TKey]>;

export type EventParams = Record<string, any>;
export type EventParamsWithSchema<
  TContext extends Context = Context,
  TSchemas extends Schemas = Schemas,
  TKey extends keyof TSchemas = keyof TSchemas,
> = {
  schema: TKey;
  params: ((context: TContext) => SchemaParams<TSchemas, TKey>) | SchemaParams<TSchemas, TKey>;
};

export type EventParamsWithContext<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
> = TEventParams | ((context: TContext) => TEventParams);
export type EventFunction<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
  TKey extends keyof TSchemas = keyof TSchemas,
> = (params: TEventParams, context: TContext, setContext: SetContext<TContext>) => TaskReturnType<TTaskResult>;
/** Task Return Type */
/**
 * Type of the return value of the event function.
 */
export type Task<TTaskResult extends TaskResult = TaskResult> = (...args: any) => TaskReturnType<TTaskResult>;
export type TaskResult = Record<string, any>;
export type TaskReturnType<TTaskResult extends TaskResult = TaskResult> =
  | TTaskResult
  | void
  | Promise<void | TTaskResult>;

/** DOMEvents */
export type DOMEventNames = keyof Omit<DOMAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">;
export type DOMEvents<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
> = Partial<Record<DOMEventNames, EventFunction<TContext, TEventParams, TSchemas, TTaskResult, keyof TSchemas>>>;

/** Impression */
export interface ImpressionConfig<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
> {
  onImpression: EventFunction<TContext, TEventParams, TSchemas, TTaskResult>;
  options?: ImpressionOptions;
}
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

/** Page View */
export interface PageViewConfig<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
> {
  onPageView: EventFunction<TContext, TEventParams, TSchemas, TTaskResult>;
  /**
   * TODO: add options
   */
  // options?: PageViewOptions;
}

/** Schema */
export type Schemas = Record<string, StandardSchemaV1<any, any>>;
export interface SchemaConfig<TSchemas extends Schemas = Schemas> {
  /** A record of schemas */
  schemas: TSchemas;
  /** A function to handle schema errors */
  onSchemaError?: (error: ReadonlyArray<StandardSchemaV1.Issue>) => void;
  /** If true, abort the event execution if a schema error occurs */
  abortOnError?: boolean;
}

export type UnionPropsWithAndWithoutSchema<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TKey extends keyof TSchemas = keyof TSchemas,
> = PropsWithSchema<TContext, TSchemas, TKey> | PropsWithoutSchema<TContext, TEventParams>;

export type PropsWithSchema<
  TContext extends Context = Context,
  TSchemas extends Schemas = Schemas,
  TKey extends keyof TSchemas = keyof TSchemas,
> = {
  schema: TKey;
  params: ((context: TContext) => SchemaParams<TSchemas, TKey>) | SchemaParams<TSchemas, TKey>;
};

export type PropsWithoutSchema<TContext extends Context = Context, TEventParams extends EventParams = EventParams> = {
  schema?: undefined;
  params: EventParamsWithContext<TContext, TEventParams>;
};

/** Tracker */
export interface TrackerConfig<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
> {
  /**
   * Initialize the tracker with the given context.
   * @param initialContext - The initial context to use for the tracker.
   * @returns void
   */
  readonly init?: (initialContext: TContext, setContext: SetContext<TContext>) => void | Promise<void>;
  /**
   * The send function to send the event.
   * @param params - The custom params to send.
   * @param context - The context to send.
   * @returns void
   */
  readonly send?: EventFunction<TContext, TEventParams, TSchemas, TTaskResult>;
  /**
   * The native DOM events to listen to.
   */
  readonly DOMEvents?: DOMEvents<TContext, TEventParams, TSchemas, TTaskResult>;
  /**
   * The impression event to listen to.
   */
  readonly impression?: ImpressionConfig<TContext, TEventParams, TSchemas, TTaskResult>;
  /**
   * The page view event to listen to.
   */
  readonly pageView?: PageViewConfig<TContext, TEventParams, TSchemas, TTaskResult>;
  /**
   * The batch config to send the events.
   */
  readonly batch?: BatchConfig<TTaskResult>;
  /**
   * The schema config to validate the event params.
   */
  readonly schema?: SchemaConfig<TSchemas>;
}

export interface TrackerContextProps<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
> {
  tracker: TrackerConfig<TContext, TEventParams, TSchemas, TTaskResult>;
  _setContext: (context: TContext | ((prevContext: TContext) => TContext)) => void;
  _getContext: () => TContext;
  _schedule: (task: Task<TTaskResult>) => Promise<void>;
}

/** Tracking Options */
export type EnabledCondition<TContext extends Context = Context, TEventParams extends EventParams = EventParams> =
  | boolean
  | ((context: TContext, params: TEventParams) => boolean);

export type TrackingOptions<TContext extends Context = Context, TEventParams extends EventParams = EventParams> = {
  enabled?: EnabledCondition<TContext, TEventParams>;
} & (
  | { debounce: DebounceConfig; throttle?: never }
  | { throttle: ThrottleConfig; debounce?: never }
  | { debounce?: never; throttle?: never }
);

// standard schema
/** The Standard Schema interface. */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}

export declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Validates unknown input values. */
    readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }

  /** The result interface of the validate function. */
  export type Result<Output> = SuccessResult<Output> | FailureResult;

  /** The result interface if validation succeeds. */
  export interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The non-existent issues. */
    readonly issues?: undefined;
  }

  /** The result interface if validation fails. */
  export interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }

  /** The issue interface of the failure output. */
  export interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }

  /** The path segment interface of the issue. */
  export interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }

  /** The Standard Schema types interface. */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }

  /** Infers the input type of a Standard Schema. */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["input"];

  /** Infers the output type of a Standard Schema. */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["output"];
}
