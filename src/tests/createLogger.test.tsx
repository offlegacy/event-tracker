import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { createLogger } from "..";

import { sleep } from "./utils";

const initFn = vi.fn();
const sendFn = vi.fn();
const clickFn = vi.fn();
const focusFn = vi.fn();
const impressionFn = vi.fn();
const pageViewFn = vi.fn();
const anyFn = expect.any(Function);

const [Log, useLog] = createLogger({
  init: initFn,
  send: sendFn,
  DOMEvents: {
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

describe("init", async () => {
  it("init function should be called when the Logger.Provider is mounted", () => {
    render(
      <Log.Provider initialContext={{}}>
        <div>test</div>
      </Log.Provider>,
    );

    expect(initFn).toHaveBeenCalledOnce();
  });

  it("init function should always be resolved first before any other functions run", async () => {
    initFn.mockImplementationOnce(() => sleep(500));
    const context = { userId: "id" };
    const clickParams = { a: 1 };
    const pageViewParams = { page: "/home" };

    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.Click params={clickParams}>
          <button type="button">click</button>
        </Log.Click>
        <Log.PageView params={pageViewParams} />
      </Log.Provider>,
    );

    page.getByText("click").click();
    expect(clickFn).not.toHaveBeenCalled();
    expect(pageViewFn).not.toHaveBeenCalled();

    await sleep(500);

    expect(clickFn).toHaveBeenCalledWith(clickParams, context, anyFn);
    expect(pageViewFn).toHaveBeenCalledWith(pageViewParams, context, anyFn);
  });
});

describe("events", () => {
  it("events.onClick should be called when the element inside Logger.Click is clicked", async () => {
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
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith(clickParams, context, anyFn);
  });

  it("events.onClick can be called manually by using useLogger hook", async () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };

    const ButtonWithLogger = () => {
      const logger = useLog();

      return (
        <button type="button" onClick={() => logger.events.onClick(clickParams)}>
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
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith(clickParams, context, anyFn);
  });

  it("any DOM event such as onFoucs can be called declaratively using Logger.Event", async () => {
    const context = { userId: "id" };
    const focusEventParams = { a: 1 };
    const page = render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.DOMEvent type="onFocus" params={focusEventParams}>
          <input />
        </Log.DOMEvent>
      </Log.Provider>,
    );

    page.getByRole("textbox").focus();
    await sleep(1);

    expect(focusFn).toHaveBeenCalledWith(focusEventParams, context, anyFn);
  });
});

describe("page view", () => {
  it("page view should be called when the page is loaded", async () => {
    const context = { userId: "id" };
    const pageViewParams = { a: 1 };
    render(
      <Log.Provider initialContext={context}>
        <div>test</div>
        <Log.PageView params={pageViewParams} />
      </Log.Provider>,
    );

    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledWith(pageViewParams, context, anyFn);
  });
  it("should not call onPageView again when the page rerenders", async () => {
    const context = { userId: "id" };
    const pageViewParams = { a: 1 };

    const Page = () => {
      return (
        <Log.Provider initialContext={context}>
          <div>test</div>
          <Log.PageView params={pageViewParams} />
        </Log.Provider>
      );
    };

    const page = render(<Page />);

    page.rerender(<Page />);

    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledOnce();
  });
});

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
        <Log.PageView params={pageViewParams} />
      </Log.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(pageViewFn).toHaveBeenNthCalledWith(1, pageViewParams, newContext, anyFn);
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
    await sleep(1);

    expect(clickFn).toHaveBeenNthCalledWith(1, clickParams, { ...context, test: true }, anyFn);
  });

  it("can set context using useLogger hook", async () => {
    const context = { userId: "id" };
    const newContext = { userId: "newId" };
    const clickParams = { a: 1 };

    const { result } = renderHook(() => useLog(), {
      wrapper: ({ children }) => <Log.Provider initialContext={context}>{children}</Log.Provider>,
    });

    result.current.setContext(newContext);
    result.current.events.onClick(clickParams);
    await sleep(1);

    expect(clickFn).toHaveBeenNthCalledWith(1, clickParams, newContext, anyFn);
  });

  it("can set context in init function", async () => {
    const context = { userId: "id", test: false };

    clickFn.mockImplementationOnce((_, context) => {
      return context;
    });

    pageViewFn.mockImplementationOnce((_, __, setContext) => {
      setContext((prev: { userId: string; test: boolean }) => ({ ...prev, test: true }));
    });

    const page = render(
      <Log.Provider initialContext={context}>
        <Log.Click params={{ a: 1 }}>
          <button type="button">click</button>
        </Log.Click>
        <Log.PageView params={{ b: 1 }} />
      </Log.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledWith({ b: 1 }, { userId: "id", test: false }, anyFn);
    // expect context to have been updated in the pageViewFn
    expect(clickFn).toHaveReturnedWith({ userId: "id", test: true });
  });
});
