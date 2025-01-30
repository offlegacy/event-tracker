import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { isEventPropsWithSchema } from "../helpers/isEventPropsWithSchema";
import { isFunction } from "../helpers/isFunction";
import { Scheduler } from "../scheduler";

import { Click as PrimitiveClick } from "./components/Click";
import { DOMEvent as PrimitiveDOMEvent } from "./components/DOMEvent";
import { Impression as PrimitiveImpression } from "./components/Impression";
import { PageView as PrimitivePageView } from "./components/PageView";
import type {
  DOMEventNames,
  EventParamsWithContext,
  EventParamsWithSchema,
  ImpressionOptions,
  TrackerConfig,
  TrackerContextProps,
  UnionPropsWithAndWithoutSchema,
  AnyContext,
  AnySchemas,
  AnyEventParams,
} from "./types";

export function createTracker<
  Context extends AnyContext = AnyContext,
  EventParams extends AnyEventParams = AnyEventParams,
  Schemas extends AnySchemas = AnySchemas,
>(config: TrackerConfig<Context, EventParams, Schemas>) {
  const TrackerContext = createContext<null | TrackerContextProps<Context, EventParams, Schemas>>(null);

  const validateZodSchema = <T extends keyof Schemas>(schemaKey: T, params: z.infer<Schemas[T]>) => {
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

    const scheduledDomEvents = {} as Record<
      DOMEventNames,
      (params: EventParamsWithContext<EventParams, Context>) => void
    >;
    for (const key in trackerContext.tracker.DOMEvents) {
      scheduledDomEvents[key as DOMEventNames] = (params: EventParamsWithContext<EventParams, Context>) => {
        return trackerContext._schedule(() =>
          trackerContext.tracker.DOMEvents?.[key as DOMEventNames]?.(
            isFunction<Context, EventParams>(params) ? params(trackerContext._getContext()) : params,
            trackerContext._getContext(),
            trackerContext._setContext,
          ),
        );
      };
    }
    const scheduledDomEventsWithSchema = {} as Record<
      DOMEventNames,
      <T extends keyof Schemas>(paramsWithSchema: EventParamsWithSchema<Schemas, T, Context>) => void
    >;
    for (const key in trackerContext.tracker.DOMEvents) {
      scheduledDomEventsWithSchema[key as DOMEventNames] = <T extends keyof Schemas>(
        paramsWithSchema: EventParamsWithSchema<Schemas, T, Context>,
      ) => {
        const params = isFunction<Context, z.infer<Schemas[T]>>(paramsWithSchema.params)
          ? paramsWithSchema.params(trackerContext._getContext())
          : paramsWithSchema.params;

        validateZodSchema(paramsWithSchema.schema, params);

        return trackerContext._schedule(() =>
          trackerContext.tracker.DOMEvents?.[key as DOMEventNames]?.(
            params,
            trackerContext._getContext(),
            trackerContext._setContext,
          ),
        );
      };
    }
    return {
      send: (params: EventParamsWithContext<EventParams, Context>) =>
        trackerContext.tracker.send?.(
          isFunction<Context, EventParams>(params) ? params(trackerContext._getContext()) : params,
          trackerContext._getContext(),
          trackerContext._setContext,
        ),
      setContext: trackerContext._setContext,
      getContext: trackerContext._getContext,
      trackWithSchema: {
        ...scheduledDomEventsWithSchema,
        onImpression: <T extends keyof Schemas>(paramsWithSchema: EventParamsWithSchema<Schemas, T, Context>) => {
          const params = isFunction<Context, z.infer<Schemas[T]>>(paramsWithSchema.params)
            ? paramsWithSchema.params(trackerContext._getContext())
            : paramsWithSchema.params;

          validateZodSchema(paramsWithSchema.schema, params);

          return trackerContext._schedule(() =>
            trackerContext.tracker.impression?.onImpression(
              params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
        onPageView: <T extends keyof Schemas>(paramsWithSchema: EventParamsWithSchema<Schemas, T, Context>) => {
          const params = isFunction<Context, z.infer<Schemas[T]>>(paramsWithSchema.params)
            ? paramsWithSchema.params(trackerContext._getContext())
            : paramsWithSchema.params;

          validateZodSchema(paramsWithSchema.schema, params);
          return trackerContext._schedule(() =>
            trackerContext.tracker.pageView?.onPageView(
              params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
      },
      track: {
        ...scheduledDomEvents,
        onImpression: (params: EventParamsWithContext<EventParams, Context>) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.impression?.onImpression(
              isFunction<Context, EventParams>(params) ? params(trackerContext._getContext()) : params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
        onPageView: (params: EventParamsWithContext<EventParams, Context>) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.pageView?.onPageView(
              isFunction<Context, EventParams>(params) ? params(trackerContext._getContext()) : params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
      },
    };
  };
  const Provider = ({ children, initialContext }: { children: ReactNode; initialContext?: Context }) => {
    const contextRef = useRef<Context>(initialContext ?? ({} as Context));
    const isInitializedRef = useRef(false);
    const schedulerRef = useRef<Scheduler>(
      new Scheduler({
        isTrackerInitialized: () => isInitializedRef.current,
        batch: config.batch ?? { enable: false },
      }),
    );

    const _setContext = (context: Context | ((prevContext: Context) => Context)) => {
      if (isFunction<Context, Context>(context)) {
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

  const DOMEvent = <T extends keyof Schemas>({
    children,
    type,
    eventName,
    ...props
  }: { children: ReactNode; type: DOMEventNames; eventName?: string } & UnionPropsWithAndWithoutSchema<
    T,
    Schemas,
    EventParams,
    Context
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

  const Click = <T extends keyof Schemas>({
    children,
    ...props
  }: { children: ReactNode } & UnionPropsWithAndWithoutSchema<T, Schemas, EventParams, Context>) => {
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

  const Impression = <T extends keyof Schemas>({
    children,
    options,
    ...props
  }: {
    children: ReactNode;
    options?: ImpressionOptions;
  } & UnionPropsWithAndWithoutSchema<T, Schemas, EventParams, Context>) => {
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

  const PageView = <T extends keyof Schemas>(
    props: UnionPropsWithAndWithoutSchema<T, Schemas, EventParams, Context>,
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

  const SetContext = ({ context }: { context: Context | ((prevContext: Context) => Context) }) => {
    const tracker = useTracker();

    useEffect(() => {
      if (isFunction<Context, Context>(context)) {
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
