import type { EventResult } from "../tracker/types";

export type Batch<T = any> = EventResult<T>[];

export type OnFlush = (batch: Batch, isBrowserClosing: boolean) => void | Promise<void>;
export type OnError = (error: Error) => void | Promise<void>;

export type FlushType = "interval" | "batchFull" | "pageLeave" | "unknown";

export type BatchConfig =
  | {
      enable: false;
    }
  | {
      enable: true;
      interval?: number;
      thresholdSize?: number;
      onFlush: OnFlush;
      onError?: OnError;
    };

export interface SchedulerConfig {
  isTrackerInitialized: () => boolean;
  batch: BatchConfig;
}
