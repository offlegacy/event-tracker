"use client";

import type { ReactNode } from "react";
import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useMemo, useRef } from "react";

import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useMergeRefs } from "../hooks/useMergeRefs";
import { LogScheduler } from "../scheduler";

import type { DOMEventNames, ImpressionOptions, LoggerConfig, LoggerContextProps } from "./types";

export function createLogger<Context, SendParams, EventParams, ImpressionParams, PageViewParams>(
  config: LoggerConfig<Context, SendParams, EventParams, ImpressionParams, PageViewParams>,
) {
  const LoggerContext = createContext<null | LoggerContextProps<
    Context,
    SendParams,
    EventParams,
    ImpressionParams,
    PageViewParams
  >>(null);

  const useLogger = () => {
    const loggerContext = useContext(LoggerContext);
    if (loggerContext === null) {
      throw new Error("useLogger must be used within a LoggerProvider");
    }

    const scheduledDomEvents = {} as Record<DOMEventNames, (params: EventParams) => void>;
    for (const key in loggerContext.logger.DOMEvents) {
      scheduledDomEvents[key as DOMEventNames] = (params: EventParams) => {
        return loggerContext._schedule(() =>
          loggerContext.logger.DOMEvents?.[key as DOMEventNames]?.(
            params,
            loggerContext._getContext(),
            loggerContext._setContext,
          ),
        );
      };
    }
    return {
      send: (params: SendParams) =>
        loggerContext.logger.send?.(params, loggerContext._getContext(), loggerContext._setContext),
      setContext: loggerContext._setContext,
      getContext: loggerContext._getContext,
      events: {
        ...scheduledDomEvents,
        onImpression: (params: ImpressionParams) => {
          return loggerContext._schedule(() =>
            loggerContext.logger.impression?.onImpression(
              params,
              loggerContext._getContext(),
              loggerContext._setContext,
            ),
          );
        },
        onPageView: (params: PageViewParams) => {
          return loggerContext._schedule(() =>
            loggerContext.logger.pageView?.onPageView(params, loggerContext._getContext(), loggerContext._setContext),
          );
        },
      },
    };
  };
  const Provider = ({ children, initialContext }: { children: ReactNode; initialContext: Context }) => {
    const contextRef = useRef<Context>(initialContext);
    const isInitializedRef = useRef(false);
    const schedulerRef = useRef<LogScheduler>(
      new LogScheduler({
        isLoggerInitialized: () => isInitializedRef.current,
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
      <LoggerContext.Provider
        value={useMemo(
          () => ({
            logger: config,
            _setContext,
            _getContext: () => contextRef.current,
            _schedule: schedulerRef.current.schedule,
          }),
          [],
        )}
      >
        {children}
      </LoggerContext.Provider>
    );
  };

  const DOMEvent = ({ children, type, params }: { children: ReactNode; type: DOMEventNames; params: EventParams }) => {
    const child = Children.only(children);
    const logger = useLogger();

    return (
      isValidElement<{ [key in DOMEventNames]?: (...args: any[]) => void }>(child) &&
      cloneElement(child, {
        ...child.props,
        [type]: (...args: any[]) => {
          if (logger.events[type] !== undefined) {
            logger.events[type](params);
          }
          if (child.props && typeof child.props?.[type] === "function") {
            return child.props[type]?.(...args);
          }
        },
      })
    );
  };

  const Click = ({ children, params }: { children: ReactNode; params: EventParams }) => {
    return (
      <DOMEvent type="onClick" params={params}>
        {children}
      </DOMEvent>
    );
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
    const logger = useLogger();

    const { isIntersecting, ref: impressionRef } = useIntersectionObserver({
      ...(options ??
        config.impression?.options ?? {
          threshold: 0.2,
          freezeOnceVisible: true,
          initialIsIntersecting: false,
        }),
    });

    const child = Children.only(children);
    const hasRef = isValidElement(child) && (child as any)?.ref != null;
    const ref = useMergeRefs<HTMLDivElement>(hasRef ? [(child as any).ref, impressionRef] : [impressionRef]);

    useEffect(() => {
      if (!isIntersecting || logger.events.onImpression === undefined) {
        return;
      }
      logger.events.onImpression?.(params);
    }, [isIntersecting, logger, params]);

    return hasRef ? (
      cloneElement(child as any, {
        ref,
      })
    ) : (
      // FIXME: not a good solution since it can cause style issues
      <div aria-hidden ref={ref}>
        {child}
      </div>
    );
  };

  const PageView = ({ params }: { params: PageViewParams }) => {
    const logger = useLogger();
    useEffect(() => {
      logger.events.onPageView?.(params);
    }, [logger, params]);
    return null;
  };

  const SetContext = ({ context }: { context: Context | ((prevContext: Context) => Context) }) => {
    const logger = useLogger();

    useEffect(() => {
      if (typeof context === "function") {
        logger.setContext((context as (prevContext: Context) => Context)(logger.getContext()));
      } else {
        logger.setContext(context);
      }
    }, [logger, context]);
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
    useLogger,
  ] as const;
}
