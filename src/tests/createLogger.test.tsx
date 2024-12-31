import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { createLogger } from "..";

const initFn = vi.fn();
const sendFn = vi.fn();
const clickFn = vi.fn();
const focusFn = vi.fn();
const impressionFn = vi.fn();
const pageViewFn = vi.fn();

const [Log, useLog] = createLogger({
  init: initFn,
  send: sendFn,
  events: {
    onClick: clickFn,
    onFocus: focusFn,
  },
  impression: {
    onImpression: impressionFn,
  },
  pageView: {
    onPageView: pageViewFn,
  },
});

describe("init", () => {
  it("init function should be called when the Logger.Provider is mounted", () => {
    render(
      <Log.Provider initialContext={{}}>
        <div>test</div>
      </Log.Provider>,
    );

    expect(initFn).toHaveBeenCalledOnce();
  });
});

describe("events", () => {
  it("events.onClick should be called when the element inside Logger.Click is clicked", () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };
    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.Click params={clickParams}>
          <button type="button">click</button>
        </Log.Click>
      </Log.Provider>,
    );

    page.getByText("click").click();
    expect(clickFn).toHaveBeenCalledWith(clickParams, context);
  });

  it("events.onClick can be called manually by using useLogger hook", () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };

    const ButtonWithLogger = () => {
      const { logger } = useLog();

      return (
        <button type="button" onClick={() => logger.onClick?.(clickParams)}>
          click
        </button>
      );
    };

    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <ButtonWithLogger />
      </Log.Provider>,
    );

    page.getByText("click").click();
    expect(clickFn).toHaveBeenCalledWith(clickParams, context);
  });

  it("any DOM event such as onFoucs can be called declaratively using Logger.Event", () => {
    const context = { userId: "id" };
    const focusEventParams = { a: 1 };
    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.Event type="onFocus" params={focusEventParams}>
          <input />
        </Log.Event>
      </Log.Provider>,
    );

    page.getByRole("textbox").focus();
    expect(focusFn).toHaveBeenCalledWith(focusEventParams, context);
  });
});

describe("page view", () => {
  it("page view should be called when the page is loaded", () => {
    const context = { userId: "id" };
    const pageViewParams = { a: 1 };
    render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.PageView {...pageViewParams} />
      </Log.Provider>,
    );

    expect(pageViewFn).toHaveBeenCalledWith(pageViewParams, context);
  });
});

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

describe("set context", () => {
  it("new context should be set when the Logger.SetContext is mounted", async () => {
    const context = { userId: "id" };
    const newContext = { userId: "newId" };
    const clickParams = { a: 1 };
    const pageViewParams = { a: 1 };
    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.SetContext context={newContext} />
        <Log.Click params={clickParams}>
          <button type="button">click</button>
        </Log.Click>
        <Log.PageView {...pageViewParams} />
      </Log.Provider>,
    );

    page.getByText("click").click();
    console.log("CLICKED");
    expect(pageViewFn).toHaveBeenNthCalledWith(1, pageViewParams, newContext);
  });

  it("Logger.SetContext can set new context using previous context", async () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };

    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.Click params={clickParams}>
          <button type="button">click</button>
        </Log.Click>
        <Log.SetContext
          context={(prev: { userId: string }) => ({
            ...prev,
            test: true,
          })}
        />
      </Log.Provider>,
    );

    page.getByText("click").click();
    expect(clickFn).toHaveBeenNthCalledWith(1, clickParams, { ...context, test: true });
  });

  it("can set context using useLogger hook", () => {
    const context = { userId: "id" };
    const newContext = { userId: "newId" };
    const clickParams = { a: 1 };

    const { result } = renderHook(() => useLog(), {
      wrapper: ({ children }) => <Log.Provider initialContext={context}>{children}</Log.Provider>,
    });

    result.current.logger.setContext(newContext);
    result.current.logger.onClick(clickParams);
    expect(clickFn).toHaveBeenNthCalledWith(1, clickParams, newContext);
  });
});
