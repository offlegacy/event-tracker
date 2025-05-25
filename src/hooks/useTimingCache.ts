import { debounce } from "../utils/debounce";
import { throttle } from "../utils/throttle";

import { useRef } from "react";
import { type DebounceConfig, type DebouncedFunction } from "../utils/debounce";
import { type ThrottleConfig, type ThrottledFunction } from "../utils/throttle";

/**
 * This hook prevents creating new debounced and throttled function instances on every render by caching them
 * based on a unique key and configuration. This is particularly useful in event tracking
 * scenarios where the same debounced/throttled functions might be used multiple times across components.
 *
 * @returns An object containing the getDebounced and getThrottled functions for retrieving cached functions
 */
export function useTimingCache() {
  const debounceInstancesRef = useRef<Map<string, DebouncedFunction<any>>>(new Map());
  const throttleInstancesRef = useRef<Map<string, ThrottledFunction<any>>>(new Map());

  const getDebounced = <T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    debounceConfig: DebounceConfig,
  ): DebouncedFunction<T> => {
    // Create a unique cache key by combining the user key with stringified config
    const cacheKey = `${key}-${JSON.stringify(debounceConfig)}`;

    if (!debounceInstancesRef.current.has(cacheKey)) {
      debounceInstancesRef.current.set(cacheKey, debounce(fn, debounceConfig));
    }

    return debounceInstancesRef.current.get(cacheKey)!;
  };

  const getThrottled = <T extends (...args: any[]) => any>(
    key: string,
    fn: T,
    throttleConfig: ThrottleConfig,
  ): ThrottledFunction<T> => {
    // Create a unique cache key by combining the user key with stringified config
    const cacheKey = `${key}-${JSON.stringify(throttleConfig)}`;

    if (!throttleInstancesRef.current.has(cacheKey)) {
      throttleInstancesRef.current.set(cacheKey, throttle(fn, throttleConfig));
    }

    return throttleInstancesRef.current.get(cacheKey)!;
  };

  return { getDebounced, getThrottled };
}

// Backward compatibility
export const useDebounceCache = useTimingCache;
