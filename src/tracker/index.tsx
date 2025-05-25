import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { isEventPropsWithSchema } from "../helpers/isEventPropsWithSchema";
import { isFunction } from "../helpers/isFunction";
import { useTimingCache } from "../hooks/useTimingCache";
import { Scheduler } from "../scheduler";
import type {
  TrackerConfig,
  TaskResult,
  TrackerContextProps,
  Context,
  EventParams,
  Schemas,
  DOMEventNames,
  EventParamsWithContext,
  EventParamsWithSchema,
  UnionPropsWithAndWithoutSchema,
  EventFunction,
  ImpressionOptions,
  DOMEvents,
  SchemaParams,
  TrackingOptions,
  EnabledCondition,
} from "../types";
import { evaluateEnabledCondition } from "../utils/condition";

import { Click as PrimitiveClick } from "./components/Click";
import { DOMEvent as PrimitiveDOMEvent } from "./components/DOMEvent";
import { Impression as PrimitiveImpression } from "./components/Impression";
import { PageView as PrimitivePageView } from "./components/PageView";

export function createTracker<
  TContext extends Context = Context,
  TEventParams extends EventParams = EventParams,
  TSchemas extends Schemas = Schemas,
  TTaskResult extends TaskResult = TaskResult,
>(config: TrackerConfig<TContext, TEventParams, TSchemas, TTaskResult>) {
  const TrackerContext = createContext<null | TrackerContextProps<TContext, TEventParams, TSchemas, TTaskResult>>(null);

  const validateZodSchema = <TKey extends keyof TSchemas>(schemaKey: TKey, params: z.infer<TSchemas[TKey]>) => {
    const schema = config.schema?.schemas?.[schemaKey];
    if (schema === undefined) {
      console.warn(`Schema ${String(schemaKey)} not found`);
      return params;
    }
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        config.schema?.onSchemaError?.(error);
        if (config.schema?.abortOnError) {
          throw error;
        }
      }
    }
    return;
  };

  const useTracker = () => {
    const trackerContext = useContext(TrackerContext);
    if (trackerContext === null) {
      throw new Error("useTracker must be used within a TrackerProvider");
    }
    const { tracker, _schedule, _getContext, _setContext } = trackerContext;
    const domEvents = tracker.DOMEvents ?? ({} as DOMEvents<TContext, TEventParams, TSchemas, TTaskResult>);

    const { getDebounced, getThrottled } = useTimingCache();

    // Basic scheduled DOM events with optional options parameter
    const scheduledDomEvents = {} as Record<
      DOMEventNames,
      (params: EventParamsWithContext<TContext, TEventParams>, options?: TrackingOptions) => void
    >;

    for (const key of Object.keys(domEvents) as DOMEventNames[]) {
      scheduledDomEvents[key] = (params: EventParamsWithContext<TContext, TEventParams>, options?: TrackingOptions) => {
        const executeEvent = () => {
          return _schedule(() =>
            domEvents[key]?.(
              isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params,
              _getContext(),
              _setContext,
            ),
          );
        };

        if (options !== undefined && "debounce" in options && options.debounce) {
          const debouncedFn = getDebounced(`dom-${key}`, executeEvent, options.debounce);
          debouncedFn();
        } else if (options !== undefined && "throttle" in options && options.throttle) {
          const throttledFn = getThrottled(`dom-${key}`, executeEvent, options.throttle);
          throttledFn();
        } else {
          executeEvent();
        }
      };
    }

    // Basic scheduled DOM events with schema and optional options parameter
    const scheduledDomEventsWithSchema = {} as Record<
      DOMEventNames,
      <TKey extends keyof TSchemas>(
        paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>,
        options?: TrackingOptions,
      ) => void
    >;

    for (const key of Object.keys(domEvents) as DOMEventNames[]) {
      scheduledDomEventsWithSchema[key] = <TKey extends keyof TSchemas>(
        paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>,
        options?: TrackingOptions,
      ) => {
        const executeEvent = () => {
          const params = isFunction<TContext, SchemaParams<TSchemas, TKey>>(paramsWithSchema.params)
            ? paramsWithSchema.params(_getContext())
            : paramsWithSchema.params;

          validateZodSchema(paramsWithSchema.schema, params);

          return _schedule(() =>
            domEvents[key]?.(params as TEventParams & SchemaParams<TSchemas, TKey>, _getContext(), _setContext),
          );
        };

        if (options !== undefined && "debounce" in options && options.debounce) {
          const debouncedFn = getDebounced(`dom-schema-${key}`, executeEvent, options.debounce);
          debouncedFn();
        } else if (options !== undefined && "throttle" in options && options.throttle) {
          const throttledFn = getThrottled(`dom-schema-${key}`, executeEvent, options.throttle);
          throttledFn();
        } else {
          executeEvent();
        }
      };
    }

    // Basic schedule event with schema
    const scheduleEventWithSchema = <TKey extends keyof TSchemas>(
      event?: EventFunction<TContext, TEventParams, TSchemas, TTaskResult, TKey>,
    ) => {
      return (paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>, options?: TrackingOptions) => {
        const executeEvent = () => {
          const params = isFunction<TContext, z.infer<TSchemas[TKey]>>(paramsWithSchema.params)
            ? paramsWithSchema.params(_getContext())
            : paramsWithSchema.params;

          validateZodSchema(paramsWithSchema.schema, params);

          return _schedule(() =>
            event?.(params as TEventParams & SchemaParams<TSchemas, TKey>, _getContext(), _setContext),
          );
        };

        if (options !== undefined && "debounce" in options && options.debounce) {
          const eventName = event?.name || "anonymous-event";
          const debouncedFn = getDebounced(`event-schema-${eventName}`, executeEvent, options.debounce);
          debouncedFn();
        } else if (options !== undefined && "throttle" in options && options.throttle) {
          const eventName = event?.name || "anonymous-event";
          const throttledFn = getThrottled(`event-schema-${eventName}`, executeEvent, options.throttle);
          throttledFn();
        } else {
          executeEvent();
        }
      };
    };

    // Basic schedule event
    const scheduleEvent = (event?: EventFunction<TContext, TEventParams, TSchemas, TTaskResult>) => {
      return (params: EventParamsWithContext<TContext, TEventParams>, options?: TrackingOptions) => {
        const executeEvent = () => {
          return _schedule(() =>
            event?.(
              isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params,
              _getContext(),
              _setContext,
            ),
          );
        };

        if (options !== undefined && "debounce" in options && options.debounce) {
          const eventName = event?.name || "anonymous-event";
          const debouncedFn = getDebounced(`event-${eventName}`, executeEvent, options.debounce);
          debouncedFn();
        } else if (options !== undefined && "throttle" in options && options.throttle) {
          const eventName = event?.name || "anonymous-event";
          const throttledFn = getThrottled(`event-${eventName}`, executeEvent, options.throttle);
          throttledFn();
        } else {
          executeEvent();
        }
      };
    };

    return {
      send: (params: EventParamsWithContext<TContext, TEventParams>) =>
        tracker.send?.(
          (isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params) as TEventParams &
            SchemaParams<TSchemas, keyof TSchemas>,
          _getContext(),
          _setContext,
        ),
      setContext: _setContext,
      getContext: _getContext,
      trackWithSchema: {
        ...scheduledDomEventsWithSchema,
        onImpression: scheduleEventWithSchema(tracker.impression?.onImpression),
        onPageView: scheduleEventWithSchema(tracker.pageView?.onPageView),
      },
      track: {
        ...scheduledDomEvents,
        onImpression: scheduleEvent(tracker.impression?.onImpression),
        onPageView: scheduleEvent(tracker.pageView?.onPageView),
      },
    };
  };
  const Provider = ({ children, initialContext }: { children: ReactNode; initialContext?: TContext }) => {
    const contextRef = useRef<TContext>(initialContext ?? ({} as TContext));
    const isInitializedRef = useRef(false);
    const schedulerRef = useRef<Scheduler<TTaskResult>>(
      new Scheduler({
        isTrackerInitialized: () => isInitializedRef.current,
        batch: config.batch ?? { enable: false },
      }),
    );

    const _setContext = (context: TContext | ((prevContext: TContext) => TContext)) => {
      if (isFunction<TContext, TContext>(context)) {
        contextRef.current = context(contextRef.current);
      } else {
        contextRef.current = context;
      }
    };

    useEffect(() => {
      const initialize = config.init?.(contextRef.current, _setContext);

      if (initialize instanceof Promise) {
        initialize.then(() => {
          isInitializedRef.current = true;
          schedulerRef.current.startDelayedJobs();
        });
      } else {
        isInitializedRef.current = true;
        schedulerRef.current.startDelayedJobs();
      }

      const scheduler = schedulerRef.current;

      scheduler.listen();
      return () => {
        scheduler.remove();
      };
    }, [initialContext]);

    return (
      <TrackerContext.Provider
        value={useMemo(
          () => ({
            tracker: config,
            _setContext,
            _getContext: () => contextRef.current,
            _schedule: schedulerRef.current.schedule,
          }),
          [],
        )}
      >
        {children}
      </TrackerContext.Provider>
    );
  };

  const DOMEvent = <TKey extends keyof TSchemas>({
    children,
    type,
    eventName,
    enabled,
    ...props
  }: {
    children: ReactNode;
    type: DOMEventNames;
    eventName?: string;
    enabled?: EnabledCondition<TContext, TEventParams>;
  } & TrackingOptions &
    UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    const onTrigger = useCallback(() => {
      // Check enabled condition first
      const resolvedParams = isEventPropsWithSchema(props)
        ? isFunction<TContext, SchemaParams<TSchemas, TKey>>(props.params)
          ? props.params(tracker.getContext())
          : props.params
        : isFunction<TContext, TEventParams>(props.params)
          ? props.params(tracker.getContext())
          : props.params;

      const isEnabled = evaluateEnabledCondition(enabled, tracker.getContext(), resolvedParams);
      if (!isEnabled) return;

      let options: TrackingOptions = {};
      if ("debounce" in props && props.debounce) options = { debounce: props.debounce };
      else if ("throttle" in props && props.throttle) options = { throttle: props.throttle };

      void (isEventPropsWithSchema(props)
        ? tracker.trackWithSchema[type]?.(props, options)
        : tracker.track[type]?.(props.params, options));
    }, [tracker, props, type, enabled]);

    return (
      <PrimitiveDOMEvent eventName={eventName} type={type} onTrigger={onTrigger}>
        {children}
      </PrimitiveDOMEvent>
    );
  };

  const Click = <TKey extends keyof TSchemas>({
    children,
    enabled,
    ...props
  }: {
    children: ReactNode;
    enabled?: EnabledCondition<TContext, TEventParams>;
  } & TrackingOptions &
    UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    const onClick = useCallback(() => {
      // Check enabled condition first
      const resolvedParams = isEventPropsWithSchema(props)
        ? isFunction<TContext, SchemaParams<TSchemas, TKey>>(props.params)
          ? props.params(tracker.getContext())
          : props.params
        : isFunction<TContext, TEventParams>(props.params)
          ? props.params(tracker.getContext())
          : props.params;

      const isEnabled = evaluateEnabledCondition(enabled, tracker.getContext(), resolvedParams);
      if (!isEnabled) return;

      let options: TrackingOptions = {};
      if ("debounce" in props && props.debounce) options = { debounce: props.debounce };
      else if ("throttle" in props && props.throttle) options = { throttle: props.throttle };

      void (isEventPropsWithSchema(props)
        ? tracker.trackWithSchema.onClick?.(props, options)
        : tracker.track.onClick?.(props.params, options));
    }, [tracker, props, enabled]);

    return <PrimitiveClick onClick={onClick}>{children}</PrimitiveClick>;
  };

  const Impression = <TKey extends keyof TSchemas>({
    children,
    options,
    enabled,
    ...props
  }: {
    children: ReactNode;
    options?: ImpressionOptions;
    enabled?: EnabledCondition<TContext, TEventParams>;
  } & TrackingOptions &
    UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    const onImpression = useCallback(() => {
      // Check enabled condition first
      const resolvedParams = isEventPropsWithSchema(props)
        ? isFunction<TContext, SchemaParams<TSchemas, TKey>>(props.params)
          ? props.params(tracker.getContext())
          : props.params
        : isFunction<TContext, TEventParams>(props.params)
          ? props.params(tracker.getContext())
          : props.params;

      const isEnabled = evaluateEnabledCondition(enabled, tracker.getContext(), resolvedParams);
      if (!isEnabled) return;

      let trackingOptions: TrackingOptions = {};
      if ("debounce" in props && props.debounce) trackingOptions = { debounce: props.debounce };
      else if ("throttle" in props && props.throttle) trackingOptions = { throttle: props.throttle };

      void (isEventPropsWithSchema(props)
        ? tracker.trackWithSchema.onImpression?.(props, trackingOptions)
        : tracker.track.onImpression?.(props.params, trackingOptions));
    }, [tracker, props, enabled]);

    return (
      <PrimitiveImpression options={options} onImpression={onImpression}>
        {children}
      </PrimitiveImpression>
    );
  };

  const PageView = <TKey extends keyof TSchemas>({
    enabled,
    ...props
  }: {
    enabled?: EnabledCondition<TContext, TEventParams>;
  } & TrackingOptions &
    UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    const onPageView = useCallback(() => {
      // Check enabled condition first
      const resolvedParams = isEventPropsWithSchema(props)
        ? isFunction<TContext, SchemaParams<TSchemas, TKey>>(props.params)
          ? props.params(tracker.getContext())
          : props.params
        : isFunction<TContext, TEventParams>(props.params)
          ? props.params(tracker.getContext())
          : props.params;

      const isEnabled = evaluateEnabledCondition(enabled, tracker.getContext(), resolvedParams);
      if (!isEnabled) return;

      let options: TrackingOptions = {};
      if ("debounce" in props && props.debounce) options = { debounce: props.debounce };
      else if ("throttle" in props && props.throttle) options = { throttle: props.throttle };

      void (isEventPropsWithSchema(props)
        ? tracker.trackWithSchema.onPageView?.(props, options)
        : tracker.track.onPageView?.(props.params, options));
    }, [tracker, props, enabled]);

    return <PrimitivePageView onPageView={onPageView} />;
  };

  const SetContext = ({ context }: { context: TContext | ((prevContext: TContext) => TContext) }) => {
    const tracker = useTracker();

    useEffect(() => {
      if (isFunction<TContext, TContext>(context)) {
        tracker.setContext(context(tracker.getContext()));
      } else {
        tracker.setContext(context);
      }
    }, [tracker, context]);
    return null;
  };

  return [
    {
      Provider,
      DOMEvent,
      Click,
      Impression,
      PageView,
      SetContext,
    },
    useTracker,
  ] as const;
}
