/**
 * Throttle configuration options
 */
export interface ThrottleConfig {
  /** Delay in milliseconds */
  delay: number;
  /** Execute on the leading edge (default: true) */
  leading?: boolean;
  /** Execute on the trailing edge (default: false) */
  trailing?: boolean;
}

/**
 * Throttled function interface with cancel and flush methods
 */
export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a throttled version of the provided function
 *
 * @param fn - The function to throttle
 * @param options - Throttle configuration
 * @returns Throttled function with cancel and flush methods
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, options: ThrottleConfig): ThrottledFunction<T> {
  const { delay, leading = true, trailing = false } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastInvokeTime = 0;
  let isThrottled = false;

  const invokeFunction = (...args: Parameters<T>) => {
    lastInvokeTime = Date.now();
    fn(...args);
  };

  const throttledFn = (...args: Parameters<T>) => {
    // If both leading and trailing are explicitly false, do nothing
    if (!leading && trailing === false && options.trailing !== undefined) {
      return;
    }

    // If leading is false and trailing is not explicitly set (default behavior)
    // Execute after delay on first call only
    if (!leading && options.trailing === undefined) {
      if (!isThrottled) {
        isThrottled = true;
        lastArgs = args;

        timeoutId = setTimeout(() => {
          if (lastArgs !== null) {
            invokeFunction(...lastArgs);
          }
          isThrottled = false;
          timeoutId = null;
          lastArgs = null;
        }, delay);
      }
      return;
    }

    lastArgs = args;

    // If not currently throttled
    if (!isThrottled) {
      isThrottled = true;

      // Execute on leading edge if enabled
      if (leading) {
        invokeFunction(...args);
      }

      // Handle zero delay case
      if (delay === 0) {
        // For zero delay, use setTimeout(0) to reset throttling after current execution context
        setTimeout(() => {
          isThrottled = false;
        }, 0);
        return;
      }

      // Set timeout to reset throttling and handle trailing execution
      timeoutId = setTimeout(() => {
        // Execute trailing if enabled and we have args
        if (trailing && lastArgs !== null) {
          invokeFunction(...lastArgs);
        }

        // Reset state
        isThrottled = false;
        timeoutId = null;
        lastArgs = null;
      }, delay);
    }
    // If currently throttled, just update lastArgs for potential trailing execution
  };

  // Cancel method - clears timeout and resets state
  throttledFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isThrottled = false;
    lastInvokeTime = 0;
    lastArgs = null;
  };

  // Flush method - executes immediately if there's a pending call
  throttledFn.flush = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (lastArgs !== null) {
      invokeFunction(...lastArgs);
      lastArgs = null;
    }
    isThrottled = false;
  };

  return throttledFn as ThrottledFunction<T>;
}
