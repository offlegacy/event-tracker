import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { Scheduler } from "../scheduler";

import { Click as PrimitiveClick } from "./components/Click";
import { DOMEvent as PrimitiveDOMEvent } from "./components/DOMEvent";
import { Impression as PrimitiveImpression } from "./components/Impression";
import { PageView as PrimitivePageView } from "./components/PageView";
import type { DOMEventNames, ImpressionOptions, TrackerConfig, TrackerContextProps } from "./types";

export function createTracker<Context, SendParams, EventParams, ImpressionParams, PageViewParams>(
  config: TrackerConfig<Context, SendParams, EventParams, ImpressionParams, PageViewParams>,
) {
  const TrackerContext = createContext<null | TrackerContextProps<
    Context,
    SendParams,
    EventParams,
    ImpressionParams,
    PageViewParams
  >>(null);

  const useTracker = () => {
    const trackerContext = useContext(TrackerContext);
    if (trackerContext === null) {
      throw new Error("useTracker must be used within a TrackerProvider");
    }

    const scheduledDomEvents = {} as Partial<Record<DOMEventNames, (params: EventParams) => void>>;
    for (const key in trackerContext.tracker.DOMEvents) {
      scheduledDomEvents[key as DOMEventNames] = (params: EventParams) => {
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
      send: (params: SendParams) =>
        trackerContext.tracker.send?.(params, trackerContext._getContext(), trackerContext._setContext),
      setContext: trackerContext._setContext,
      getContext: trackerContext._getContext,
      events: {
        ...scheduledDomEvents,
        onImpression: (params: ImpressionParams) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.impression?.onImpression(
              params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
        onPageView: (params: PageViewParams) => {
          return trackerContext._schedule(() =>
            trackerContext.tracker.pageView?.onPageView(
              params,
              trackerContext._getContext(),
              trackerContext._setContext,
            ),
          );
        },
      },
    };
  };
  const Provider = ({ children, initialContext }: { children: ReactNode; initialContext: Context }) => {
    const contextRef = useRef<Context>(initialContext);
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
      const initialize = config.init?.(initialContext, _setContext);

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
    params: EventParams;
    eventName?: string;
  }) => {
    const tracker = useTracker();

    return (
      <PrimitiveDOMEvent eventName={eventName} type={type} onEventOccur={() => tracker.events[type]?.(params)}>
        {children}
      </PrimitiveDOMEvent>
    );
  };

  const Click = ({ children, params }: { children: ReactNode; params: EventParams }) => {
    const tracker = useTracker();

    return <PrimitiveClick onClick={() => tracker.events.onClick?.(params)}>{children}</PrimitiveClick>;
  };

  const Impression = ({
    children,
    params,
    options,
  }: {
    children: ReactNode;
    params: ImpressionParams;
    options?: ImpressionOptions;
  }) => {
    const tracker = useTracker();

    return (
      <PrimitiveImpression options={options} onImpression={() => tracker.events.onImpression(params)}>
        {children}
      </PrimitiveImpression>
    );
  };

  const PageView = ({ params }: { params: PageViewParams }) => {
    const tracker = useTracker();

    return <PrimitivePageView onPageView={() => tracker.events.onPageView(params)} />;
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
