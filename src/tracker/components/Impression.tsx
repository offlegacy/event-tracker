import type { ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import type { ImpressionOptions } from "../types";

export interface ImpressionProps {
  children: ReactNode;
  onImpression: () => Promise<void>;
  options?: ImpressionOptions;
}

export const Impression = ({ children, onImpression, options }: ImpressionProps) => {
  const { ref: impressionRef } = useIntersectionObserver({
    ...options,
    onChange: (isIntersecting) => {
      if (isIntersecting) onImpression();
    },
  });

  const child = Children.only(children);
  const hasRef = isValidElement(child) && (child as any)?.ref != null;
  const ref = useMergeRefs<HTMLDivElement>(hasRef ? [(child as any).ref, impressionRef] : [impressionRef]);

  return hasRef ? (
    cloneElement(child as any, {
      ref,
    })
  ) : (
    // FIXME: not a good solution since it can cause style issues
    <div aria-hidden ref={ref}>
      {child}
    </div>
  );
};
