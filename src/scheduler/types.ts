import { TaskResult } from "../types";

export type Batch<TTaskResult extends TaskResult = TaskResult> = TTaskResult[];

export type OnFlush<TTaskResult extends TaskResult = TaskResult> = (
  batch: Batch<TTaskResult>,
  isBrowserClosing: boolean,
) => void | Promise<void>;
export type OnError = (error: Error) => void | Promise<void>;

export type FlushType = "interval" | "batchFull" | "pageLeave" | "unknown";

export type BatchConfig<TTaskResult extends TaskResult = TaskResult> =
  | {
      enable: false;
    }
  | {
      enable: true;
      interval?: number;
      thresholdSize?: number;
      onFlush: OnFlush<TTaskResult>;
      onError?: OnError;
    };

export interface SchedulerConfig<TTaskResult extends TaskResult = TaskResult> {
  isTrackerInitialized: () => boolean;
  batch: BatchConfig<TTaskResult>;
}
