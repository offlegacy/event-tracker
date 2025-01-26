import type { DOMEventProps } from "./DOMEvent";
import { DOMEvent } from "./DOMEvent";

export interface ClickProps extends Omit<DOMEventProps, "type" | "onEventOccur"> {
  onClick: () => Promise<void> | void;
}

export const Click = ({ children, onClick, eventName }: ClickProps) => {
  return (
    <DOMEvent eventName={eventName} type="onClick" onEventOccur={onClick}>
      {children}
    </DOMEvent>
  );
};
