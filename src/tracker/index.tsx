import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { isEventPropsWithSchema } from "../helpers/isEventPropsWithSchema";
import { isFunction } from "../helpers/isFunction";
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
} from "../types";

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
    const domEvents = tracker.DOMEvents ?? {};

    const scheduledDomEvents = {} as Record<
      DOMEventNames,
      (params: EventParamsWithContext<TContext, TEventParams>) => void
    >;
    for (const key of Object.keys(domEvents) as DOMEventNames[]) {
      scheduledDomEvents[key] = (params: EventParamsWithContext<TContext, TEventParams>) => {
        return _schedule(() =>
          domEvents[key]?.(
            isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params,
            _getContext(),
            _setContext,
          ),
        );
      };
    }
    const scheduledDomEventsWithSchema = {} as Record<
      DOMEventNames,
      <TKey extends keyof TSchemas>(paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>) => void
    >;
    for (const key of Object.keys(domEvents) as DOMEventNames[]) {
      scheduledDomEventsWithSchema[key] = <TKey extends keyof TSchemas>(
        paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>,
      ) => {
        const params = isFunction<TContext, z.infer<TSchemas[TKey]>>(paramsWithSchema.params)
          ? paramsWithSchema.params(_getContext())
          : paramsWithSchema.params;

        validateZodSchema(paramsWithSchema.schema, params);

        return _schedule(() => domEvents[key]?.(params, _getContext(), _setContext));
      };
    }
    const createScheduledHandlerWithSchema = <TKey extends keyof TSchemas>(
      handler?: EventFunction<TContext, TEventParams, TSchemas, TTaskResult, TKey>,
    ) => {
      return (paramsWithSchema: EventParamsWithSchema<TContext, TSchemas, TKey>) => {
        const params = isFunction<TContext, z.infer<TSchemas[TKey]>>(paramsWithSchema.params)
          ? paramsWithSchema.params(_getContext())
          : paramsWithSchema.params;

        validateZodSchema(paramsWithSchema.schema, params);

        return _schedule(() => handler?.(params, _getContext(), _setContext));
      };
    };
    const createScheduledHandler = (handler?: EventFunction<TContext, TEventParams, TSchemas, TTaskResult>) => {
      return (params: EventParamsWithContext<TContext, TEventParams>) => {
        return _schedule(() =>
          handler?.(
            isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params,
            _getContext(),
            _setContext,
          ),
        );
      };
    };
    return {
      send: (params: EventParamsWithContext<TEventParams, TContext>) =>
        tracker.send?.(
          isFunction<TContext, TEventParams>(params) ? params(_getContext()) : params,
          _getContext(),
          _setContext,
        ),
      setContext: _setContext,
      getContext: _getContext,
      trackWithSchema: {
        ...scheduledDomEventsWithSchema,
        onImpression: createScheduledHandlerWithSchema(tracker.impression?.onImpression),
        onPageView: createScheduledHandlerWithSchema(tracker.pageView?.onPageView),
      },
      track: {
        ...scheduledDomEvents,
        onImpression: createScheduledHandler(tracker.impression?.onImpression),
        onPageView: createScheduledHandler(tracker.pageView?.onPageView),
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
    ...props
  }: { children: ReactNode; type: DOMEventNames; eventName?: string } & UnionPropsWithAndWithoutSchema<
    TContext,
    TEventParams,
    TSchemas,
    TKey
  >) => {
    const tracker = useTracker();

    return (
      <PrimitiveDOMEvent
        eventName={eventName}
        type={type}
        onTrigger={() => {
          isEventPropsWithSchema(props) ? tracker.trackWithSchema[type]?.(props) : tracker.track[type]?.(props.params);
        }}
      >
        {children}
      </PrimitiveDOMEvent>
    );
  };

  const Click = <TKey extends keyof TSchemas>({
    children,
    ...props
  }: { children: ReactNode } & UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    return (
      <PrimitiveClick
        onClick={() => {
          isEventPropsWithSchema(props)
            ? tracker.trackWithSchema.onClick?.(props)
            : tracker.track.onClick?.(props.params);
        }}
      >
        {children}
      </PrimitiveClick>
    );
  };

  const Impression = <TKey extends keyof TSchemas>({
    children,
    options,
    ...props
  }: {
    children: ReactNode;
    options?: ImpressionOptions;
  } & UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>) => {
    const tracker = useTracker();

    return (
      <PrimitiveImpression
        options={options}
        onImpression={() => {
          isEventPropsWithSchema(props)
            ? tracker.trackWithSchema.onImpression?.(props)
            : tracker.track.onImpression?.(props.params);
        }}
      >
        {children}
      </PrimitiveImpression>
    );
  };

  const PageView = <TKey extends keyof TSchemas>(
    props: UnionPropsWithAndWithoutSchema<TContext, TEventParams, TSchemas, TKey>,
  ) => {
    const tracker = useTracker();

    return (
      <PrimitivePageView
        onPageView={() => {
          isEventPropsWithSchema(props)
            ? tracker.trackWithSchema.onPageView?.(props)
            : tracker.track.onPageView?.(props.params);
        }}
      />
    );
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
