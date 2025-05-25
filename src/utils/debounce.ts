/**
 * Debounce configuration options
 */
export interface DebounceConfig {
  /** Delay in milliseconds */
  delay: number;
  /** Execute on the leading edge (default: false) */
  leading?: boolean;
  /** Execute on the trailing edge (default: true) */
  trailing?: boolean;
}

/**
 * Debounced function interface with cancel and flush methods
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Creates a debounced version of the provided function
 *
 * @param fn - The function to debounce
 * @param options - Debounce configuration
 * @returns Debounced function with cancel and flush methods
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, options: DebounceConfig): DebouncedFunction<T> {
  const { delay, leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let hasInvokedLeading = false;

  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args;

    // Leading edge execution
    if (leading && !hasInvokedLeading && timeoutId === null) {
      hasInvokedLeading = true;
      fn(...args);
    }

    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for trailing edge
    timeoutId = setTimeout(() => {
      if (trailing && lastArgs !== null) {
        // Execute trailing edge if:
        // 1. Only trailing is enabled, OR
        // 2. Both leading and trailing are enabled (separate call)
        if (!leading || (leading && trailing)) {
          fn(...lastArgs);
        }
      }

      // Reset state
      timeoutId = null;
      hasInvokedLeading = false;
      lastArgs = null;
    }, delay);
  };

  // Cancel method - clears timeout and resets state
  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    hasInvokedLeading = false;
    lastArgs = null;
  };

  // Flush method - executes immediately if there's a pending call
  debouncedFn.flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      fn(...lastArgs);

      // Reset state
      timeoutId = null;
      hasInvokedLeading = false;
      lastArgs = null;
    }
  };

  return debouncedFn as DebouncedFunction<T>;
}
