import type { DOMEventProps } from "./DOMEvent";
import { DOMEvent } from "./DOMEvent";

export interface ClickProps extends Omit<DOMEventProps, "type" | "onTrigger"> {
  onClick: () => Promise<void> | void;
}

export const Click = ({ children, onClick, eventName }: ClickProps) => {
  return (
    <DOMEvent eventName={eventName} type="onClick" onTrigger={onClick}>
      {children}
    </DOMEvent>
  );
};
