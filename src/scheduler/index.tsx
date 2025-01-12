import type { EventResult, Task } from "../tracker/types";

import type { FlushType, OnError, OnFlush, SchedulerConfig } from "./types";

const DEFAULT_INTERVAL = 3000;
const DEFAULT_THRESHOLD_SIZE = 25;

export class Scheduler {
  onFlush?: OnFlush;
  onError?: OnError;
  delayedTasks: Task[] = [];
  batch: EventResult[] = [];

  private taskPromiseChain: Promise<void | EventResult> = Promise.resolve();

  private isBatchEnabled: boolean;
  private isTrackerInitialized: () => boolean;
  private interval: number = DEFAULT_INTERVAL;
  private thresholdSize: number = DEFAULT_THRESHOLD_SIZE;

  private timer: ReturnType<typeof setTimeout> | null = null;
  private visibilityChangeEventListener: (() => void) | null = null;
  private beforeUnloadEventListener: (() => void) | null = null;
  private pageHideEventListener: (() => void) | null = null;

  constructor(config: SchedulerConfig) {
    if (config.batch?.enable) {
      this.onFlush = config.batch.onFlush;
      this.onError = config.batch.onError;
      this.interval = config.batch?.interval ?? DEFAULT_INTERVAL;
      this.thresholdSize = config.batch?.thresholdSize ?? DEFAULT_THRESHOLD_SIZE;
    }
    this.isBatchEnabled = config.batch?.enable;
    this.isTrackerInitialized = config.isTrackerInitialized;

    // NOTE: bind 'this' to public properties in order to maintain the reference when called in closures.
    this.schedule = this.schedule.bind(this);
    this.listen = this.listen.bind(this);
    this.remove = this.remove.bind(this);
    this.startDelayedJobs = this.startDelayedJobs.bind(this);
  }

  /**
   * There are three scenarios to flush tasks:
   * 1. `batch` is enabled, interval is reached, tasks are flushed.
   * 2. `batch` is enabled, the params queue is full, tasks are flushed.
   * 3. `batch` is enabled, the user closes the browser, tasks are flushed.
   */
  private async flushTasks({ type }: { type: FlushType }) {
    try {
      if (this.batch.length > 0) {
        const result = this.onFlush?.(this.batch, type === "pageLeave");
        if (result instanceof Promise) {
          await result;
        }
        this.batch = [];
      }
      this.timer = setTimeout(() => this.flushTasks({ type: "interval" }), this.interval);
    } catch (error) {
      if (error instanceof Error) {
        this.onError?.(error);
      }
    }
  }

  private startTimer() {
    if (this.isBatchEnabled && this.timer == null && this.isTrackerInitialized()) {
      this.timer = setTimeout(() => this.flushTasks({ type: "interval" }), this.interval);
    }
  }

  private destroyTimer() {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.batch.length > 0) {
      this.flushTasks({ type: "unknown" });
    }
  }

  private addLeavePageListeners() {
    if (
      this.isBatchEnabled &&
      this.isTrackerInitialized() &&
      this.visibilityChangeEventListener == null &&
      this.beforeUnloadEventListener == null &&
      this.pageHideEventListener == null
    ) {
      this.visibilityChangeEventListener = () => {
        if (document.visibilityState === "hidden") {
          this.flushTasks({ type: "pageLeave" });
        }
      };
      this.beforeUnloadEventListener = () => {
        this.flushTasks({ type: "pageLeave" });
      };
      this.pageHideEventListener = () => {
        this.flushTasks({ type: "pageLeave" });
      };
      document.addEventListener("visibilitychange", this.visibilityChangeEventListener);
      document.addEventListener("beforeunload", this.beforeUnloadEventListener);
      document.addEventListener("pagehide", this.pageHideEventListener);
    }
  }

  private removeLeavePageListeners() {
    if (
      this.visibilityChangeEventListener != null &&
      this.beforeUnloadEventListener != null &&
      this.pageHideEventListener != null
    ) {
      document.removeEventListener("visibilitychange", this.visibilityChangeEventListener);
      document.removeEventListener("beforeunload", this.beforeUnloadEventListener);
      document.removeEventListener("pagehide", this.pageHideEventListener);
    }
    this.visibilityChangeEventListener = null;
    this.beforeUnloadEventListener = null;
    this.pageHideEventListener = null;
  }

  listen() {
    if (this.isTrackerInitialized()) {
      this.startTimer();
      this.addLeavePageListeners();
    }
  }

  remove() {
    this.destroyTimer();
    this.removeLeavePageListeners();
  }

  async schedule(task: Task) {
    if (!this.isTrackerInitialized()) {
      this.delayedTasks.push(task);
      return;
    }

    this.taskPromiseChain = this.taskPromiseChain
      .then(async () => {
        const result = task();
        if (this.isBatchEnabled) {
          const resolvedResult = result instanceof Promise ? await result : result;
          if (typeof resolvedResult === "object") {
            this.batch.push(resolvedResult);
            if (this.batch.length >= this.thresholdSize) {
              await this.flushTasks({ type: "batchFull" });
            }
          }
        } else {
          if (result instanceof Promise) {
            await result;
          }
        }
      })
      .catch((error) => {
        if (error instanceof Error) {
          this.onError?.(error);
        } else {
          throw error;
        }
      });
  }

  // Should this feature be served by the scheduler?
  async scheduleDelayedTasks() {
    for (const task of this.delayedTasks) {
      await this.schedule(task);
    }
    this.delayedTasks = [];
  }

  async startDelayedJobs() {
    this.listen();
    await this.scheduleDelayedTasks();
  }
}
