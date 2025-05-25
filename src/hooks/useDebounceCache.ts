import { debounce } from "../utils/debounce";

import { useRef } from "react";
import { type DebounceConfig, type DebouncedFunction } from "../utils/debounce";

/**
 * This hook prevents creating new debounced function instances on every render by caching them
 * based on a unique key and debounce configuration. This is particularly useful in event tracking
 * scenarios where the same debounced functions might be used multiple times across components.
 *
 * @returns An object containing the getDebounced function for retrieving cached debounced functions
 */
export function useDebounceCache() {
  const debounceInstancesRef = useRef<Map<string, DebouncedFunction<any>>>(new Map());

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

  return { getDebounced };
}
