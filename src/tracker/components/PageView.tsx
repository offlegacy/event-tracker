import { useEffect, useRef } from "react";

export interface PageViewProps {
  onPageView: () => Promise<void>;
}

export const PageView = ({ onPageView }: PageViewProps) => {
  const onPageViewRef = useRef<typeof onPageView>(onPageView);

  useEffect(() => {
    onPageViewRef.current?.();
  }, [onPageViewRef]);

  return null;
};
