import type { ReactNode } from "react";
import { isValidElement, cloneElement, Children } from "react";

import type { DOMEventNames } from "../../types";

export interface DOMEventProps {
	type: DOMEventNames;
	children: ReactNode;
	onTrigger: () => Promise<void> | void;
	eventName?: string;
}

export const DOMEvent = ({
	children,
	type,
	onTrigger,
	eventName = type,
}: DOMEventProps) => {
	const child = Children.only(children);

	return (
		isValidElement<{ [key in string]?: (...args: any[]) => void }>(child) &&
		cloneElement(child, {
			...child.props,
			[eventName]: (...args: any[]) => {
				onTrigger?.();
				if (child.props && typeof child.props?.[eventName] === "function") {
					return child.props[eventName]?.(...args);
				}
			},
		})
	);
};
