import { DOMAttributes } from "react";

export interface ImpressionOptions {
  /**
   * A threshold indicating the percentage of the target's visibility needed to trigger the callback
   * @default 0.1
   */
  threshold?: number;
  /**
   * If true, freezes the intersection state once the element becomes visible.
   * @default false
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

type InitFunction<C> = (initialContext: C) => void;

type SendFunction<P, C> = (params: P, context: C) => void;

export type DOMEvents = Omit<DOMAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">;
type Events<P, C> = Partial<Record<keyof DOMEvents, EventFunction<P, C>>>;
type EventFunction<P, C> = (params: P, context: C) => void;

type ImpressionFunction<P, C> = (params: P, context: C) => void;

type PageViewFunction<P, C> = (params: P, context: C) => void;

type SetContextFunction<C> = (context: C) => C;

export interface LoggerConfig<Context, SendParams, EventParams, ImpressionParams, PageViewParams> {
  /**
   * Initialize the logger with the given context.
   * @param initialContext - The initial context to use for the logger.
   * @returns void
   */
  readonly init?: InitFunction<Context>;
  /**
   * The send function to send the event.
   */
  readonly send?: SendFunction<SendParams, Context>;
  /**
   * The events to listen to.
   */
  readonly events?: Events<EventParams, Context>;
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
  /**
   * The context setter.
   */
  // setContext?: SetContextFunction<Context>;
}

export interface LoggerContextProps<Context, SendParams, EventParams, ImpressionParams, PageTrackParams> {
  logger: LoggerConfig<Context, SendParams, EventParams, ImpressionParams, PageTrackParams>;
  _setContext: (context: Context | ((prevContext: Context) => Context)) => void;
  _getContext: () => Context;
}
