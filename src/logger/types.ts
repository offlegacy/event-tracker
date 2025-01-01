import { DOMAttributes } from "react";
import type { SchedulerConfig } from "../scheduler/types";

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

export type TaskReturnType = void | EventResult | Promise<void | EventResult>;
export type Task = (...args: any) => TaskReturnType;

type InitFunction<C> = (initialContext: C) => void | Promise<void>;

type SendFunction<P, C> = (params: P, context: C) => TaskReturnType;

export type DOMEventNames = keyof Omit<DOMAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">;
export type DOMEvents<P, C> = Partial<Record<DOMEventNames, DOMEventFunction<P, C>>>;

type DOMEventFunction<P, C> = (params: P, context: C) => TaskReturnType;

type ImpressionFunction<P, C> = (params: P, context: C) => TaskReturnType;

type PageViewFunction<P, C> = (params: P, context: C) => TaskReturnType;

export type EventResult<T = any> = Record<string, T>;

export type EventNames = "onImpression" | "onPageView" | DOMEventNames;

export interface LoggerConfig<Context, SendParams, DOMEventParams, ImpressionParams, PageViewParams> {
  /**
   * Initialize the logger with the given context.
   * @param initialContext - The initial context to use for the logger.
   * @returns void
   */
  readonly init?: InitFunction<Context>;
  /**
   * The send function to send the event.
   * @param params - The custom params to send.
   * @param context - The context to send.
   * @returns void
   */
  readonly send?: SendFunction<SendParams, Context>;
  /**
   * The events to listen to.
   */
  readonly DOMEvents?: DOMEvents<DOMEventParams, Context>;
  /**
   * The impression event to listen to.
   */
  impression?: {
    onImpression: ImpressionFunction<ImpressionParams, Context>;
    options?: ImpressionOptions;
  };
  /**
   * The page track event to listen to.
   */
  pageView?: {
    onPageView: PageViewFunction<PageViewParams, Context>;
    /**
     * TODO: add options
     */
    // options?: PageViewOptions;
  };
  batch?: SchedulerConfig["batch"];
}

export interface LoggerContextProps<Context, SendParams, EventParams, ImpressionParams, PageTrackParams> {
  logger: LoggerConfig<Context, SendParams, EventParams, ImpressionParams, PageTrackParams>;
  _setContext: (context: Context | ((prevContext: Context) => Context)) => void;
  _getContext: () => Context;
  _schedule: (task: Task) => Promise<void>;
}
