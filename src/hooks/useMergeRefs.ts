import { useMemo, Ref, RefCallback } from 'react';

export function useMergeRefs<Instance>(refs: Array<Ref<Instance> | undefined>): RefCallback<Instance> | null {
  return useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }

    return value => {
      refs.forEach(ref => {
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref != null) {
          (ref as React.MutableRefObject<Instance | null>).current = value;
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
