import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { Scheduler } from "../scheduler";

import { Click as PrimitiveClick } from "./components/Click";
import { DOMEvent as PrimitiveDOMEvent } from "./components/DOMEvent";
import { Impression as PrimitiveImpression } from "./components/Impression";
import { PageView as PrimitivePageView } from "./components/PageView";
import type { DOMEventNames, ImpressionOptions, TrackerConfig, TrackerContextProps } from "./types";

export function createTracker<Context, EventParams>(config: TrackerConfig<Context, EventParams>) {
  const TrackerContext = createContext<null | TrackerContextProps<Context, EventParams>>(null);

  type EventParamsWithContext = EventParams | ((context: Context) => EventParams);

  const useTracker = () => {
    const trackerContext = useContext(TrackerContext);
    if (trackerContext === null) {
      throw new Error("useTracker must be used within a TrackerProvider");
    }

    const scheduledDomEvents = {} as Record<DOMEventNames, (params: EventParamsWithContext) => void>;
    for (const key in trackerContext.tracker.DOMEvents) {
      scheduledDomEvents[key as DOMEventNames] = (params: EventParamsWithContext) => {
        return trackerContext._schedule(() =>
          trackerContext.tracker.DOMEvents?.[key as DOMEventNames]?.(
            typeof params === "function"
              ? (params as (context: Context) => EventParams)(trackerContext._getContext())
              : params,
            trackerContext._getContext(),
            trackerContext._setContext,
          ),
        );
      };
    }
    return {
      // FIXME: this function is probably useless
      send: (params: EventParamsWithContext) =>
        trackerContext.tracker.send?.(
          typeof params === "function"
            ? (params as (context: Context) => EventParams)(trackerContext._getContext())
            : params,
          trackerContext._getContext(),
          trackerContext._setContext,
        ),
      setContext: trackerContext._setContext,
      getContext: trackerContext._getContext,
      track: {
        ...scheduledDomEvents,
        onImpression: (params: EventParamsWithContext) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.impression?.onImpression(
              typeof params === "function"
                ? (params as (context: Context) => EventParams)(trackerContext._getContext())
                : params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
        onPageView: (params: EventParamsWithContext) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.pageView?.onPageView(
              typeof params === "function"
                ? (params as (context: Context) => EventParams)(trackerContext._getContext())
                : params,
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
      if (typeof context === "function") {
        contextRef.current = (context as (prevContext: Context) => Context)(contextRef.current);
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

  const DOMEvent = ({
    children,
    type,
    params,
    eventName,
  }: {
    children: ReactNode;
    type: DOMEventNames;
    params: EventParamsWithContext;
    eventName?: string;
  }) => {
    const tracker = useTracker();

    return (
      <PrimitiveDOMEvent eventName={eventName} type={type} onTrigger={() => tracker.track[type]?.(params)}>
        {children}
      </PrimitiveDOMEvent>
    );
  };

  const Click = ({ children, params }: { children: ReactNode; params: EventParams }) => {
    const tracker = useTracker();

    return <PrimitiveClick onClick={() => tracker.track.onClick?.(params)}>{children}</PrimitiveClick>;
  };

  const Impression = ({
    children,
    params,
    options,
  }: {
    children: ReactNode;
    params: EventParamsWithContext;
    options?: ImpressionOptions;
  }) => {
    const tracker = useTracker();

    return (
      <PrimitiveImpression options={options} onImpression={() => tracker.track.onImpression?.(params)}>
        {children}
      </PrimitiveImpression>
    );
  };

  const PageView = ({ params }: { params: EventParamsWithContext }) => {
    const tracker = useTracker();

    return <PrimitivePageView onPageView={() => tracker.track.onPageView?.(params)} />;
  };

  const SetContext = ({ context }: { context: Context | ((prevContext: Context) => Context) }) => {
    const tracker = useTracker();

    useEffect(() => {
      if (typeof context === "function") {
        tracker.setContext((context as (prevContext: Context) => Context)(tracker.getContext()));
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
