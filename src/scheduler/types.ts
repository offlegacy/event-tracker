import type { EventResult } from "../logger/types";

export type Batch<T = any> = EventResult<T>[];

export type OnFlush = (batch: Batch, isBrowserClosing: boolean) => void | Promise<void>;
export type OnError = (error: Error) => void | Promise<void>;

export type FlushType = "interval" | "batchFull" | "pageLeave" | "unknown";

export interface SchedulerConfig {
  isLoggerInitialized: () => boolean;
  batch:
    | {
        enable: false;
      }
    | {
        enable: true;
        /**
         * The interval(ms) to flush the params.
         * @default 3000
         */
        interval?: number;
        /**
         * The max size of the batch until it is flushed.
         * @default 25
         */
        thresholdSize?: number;
        /**
         * The function to flush the tasks.
         * @param tasks - The tasks to flush.
         */
        onFlush: OnFlush;
        /**
         * The function to handle the error.
         * @param error - The error to handle.
         */
        onError?: OnError;
      };
}
