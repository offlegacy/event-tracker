"use client";

import type { ReactNode } from "react";
import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useMemo, useRef } from "react";

import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useMergeRefs } from "../hooks/useMergeRefs";

import type { DOMEvents, ImpressionOptions, LoggerConfig, LoggerContextProps } from "./types";

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

    let _events = {} as Record<keyof DOMEvents, (params: EventParams) => void>;
    for (const key in loggerContext.logger.events) {
      _events[key as keyof DOMEvents] = (params: EventParams) => {
        return loggerContext.logger.events?.[key as keyof DOMEvents]?.(params, loggerContext._getContext());
      };
    }
    return {
      logger: {
        init: loggerContext.logger.init,
        send: loggerContext.logger.send,
        setContext: loggerContext._setContext,
        getContext: loggerContext._getContext,
        ..._events,

        onImpression: (params: ImpressionParams) => {
          return loggerContext.logger.impression?.onImpression(params, loggerContext._getContext());
        },
        onPageView: (params: PageViewParams) => {
          return loggerContext.logger.pageView?.onPageView(params, loggerContext._getContext());
        },
      },
    };
  };

  const Provider = ({ children, initialContext }: { children: ReactNode; initialContext: Context }) => {
    const contextRef = useRef<Context>(initialContext);

    if (initialContext !== undefined) {
      config.init?.(initialContext);
    }

    return (
      <LoggerContext.Provider
        value={useMemo(
          () => ({
            logger: config,
            _setContext: (context: Context | ((prevContext: Context) => Context)) => {
              if (typeof context === "function") {
                contextRef.current = (context as (prevContext: Context) => Context)(contextRef.current);
              } else {
                contextRef.current = context;
              }
            },
            _getContext: () => contextRef.current,
          }),
          [contextRef],
        )}
      >
        {children}
      </LoggerContext.Provider>
    );
  };

  const Event = ({ children, type, params }: { children: ReactNode; type: keyof DOMEvents; params: EventParams }) => {
    const child = Children.only(children);
    const { logger } = useLogger();

    return (
      isValidElement<{ [key in keyof DOMEvents]?: (...args: any[]) => void }>(child) &&
      cloneElement(child, {
        ...child.props,
        [type]: (...args: any[]) => {
          if (logger?.[type] !== undefined) {
            logger[type](params);
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
      <Event type="onClick" params={params}>
        {children}
      </Event>
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
    const { logger } = useLogger();

    const { isIntersecting, ref: impressionRef } = useIntersectionObserver({
      ...(options ??
        config.impression?.options ?? {
          threshold: 0.1,
          freezeOnceVisible: false,
          initialIsIntersecting: false,
        }),
    });

    const child = Children.only(children);
    const hasRef = isValidElement(child) && (child as any)?.ref != null;
    const ref = useMergeRefs<HTMLDivElement>(hasRef ? [(child as any).ref, impressionRef] : [impressionRef]);

    useEffect(() => {
      if (!isIntersecting || logger.onImpression === undefined) {
        return;
      }
      logger.onImpression?.(params);
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

  const PageView = (params: PageViewParams) => {
    const { logger } = useLogger();
    useEffect(() => {
      logger?.onPageView?.(params);
    }, [logger, params]);
    return null;
  };

  const SetContext = ({ context }: { context: Context | ((prevContext: Context) => Context) }) => {
    const { logger } = useLogger();

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
      Event,
      Click,
      Impression,
      PageView,
      SetContext,
    },
    useLogger,
  ] as const;
}
