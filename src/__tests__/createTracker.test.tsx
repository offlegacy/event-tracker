import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { createTracker } from "..";

import { sleep } from "./utils";

const initFn = vi.fn();
const sendFn = vi.fn();
const clickFn = vi.fn();
const focusFn = vi.fn();
const impressionFn = vi.fn();
const pageViewFn = vi.fn();
const anyFn = expect.any(Function);

const [Track, useTracker] = createTracker({
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
  it("init function should be called when the Tracker.Provider is mounted", () => {
    render(
      <Track.Provider initialContext={{}}>
        <div>test</div>
      </Track.Provider>,
    );

    expect(initFn).toHaveBeenCalledOnce();
  });

  it("init function should always be resolved first before any other functions run", async () => {
    initFn.mockImplementationOnce(() => sleep(500));
    const context = { userId: "id" };
    const clickParams = { a: 1 };
    const pageViewParams = { page: "/home" };

    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
        <Track.PageView params={pageViewParams} />
      </Track.Provider>,
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
  it("events.onClick should be called when the element inside Track.Click is clicked", async () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };
    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith(clickParams, context, anyFn);
  });

  it("events.onClick can be called manually by using useTracker hook", async () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };

    const ButtonWithTracker = () => {
      const tracker = useTracker();

      return (
        <button type="button" onClick={() => tracker.events.onClick(clickParams)}>
          click
        </button>
      );
    };

    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <ButtonWithTracker />
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith(clickParams, context, anyFn);
  });

  it("any DOM event such as onFoucs can be called declaratively using Tracker.Event", async () => {
    const context = { userId: "id" };
    const focusEventParams = { a: 1 };
    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.DOMEvent type="onFocus" params={focusEventParams}>
          <input />
        </Track.DOMEvent>
      </Track.Provider>,
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
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.PageView params={pageViewParams} />
      </Track.Provider>,
    );

    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledWith(pageViewParams, context, anyFn);
  });
  it("should not call onPageView again when the page rerenders", async () => {
    const context = { userId: "id" };
    const pageViewParams = { a: 1 };

    const Page = () => {
      return (
        <Track.Provider initialContext={context}>
          <div>test</div>
          <Track.PageView params={pageViewParams} />
        </Track.Provider>
      );
    };

    const page = render(<Page />);

    page.rerender(<Page />);

    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledOnce();
  });
});

describe("set context", () => {
  it("new context should be set when the Tracker.SetContext is mounted", async () => {
    const context = { userId: "id" };
    const newContext = { userId: "newId" };
    const clickParams = { a: 1 };
    const pageViewParams = { a: 1 };
    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.SetContext context={newContext} />
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
        <Track.PageView params={pageViewParams} />
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(pageViewFn).toHaveBeenNthCalledWith(1, pageViewParams, newContext, anyFn);
  });

  it("Track.SetContext can set new context using previous context", async () => {
    const context = { userId: "id" };
    const clickParams = { a: 1 };

    const page = render(
      <Track.Provider initialContext={context}>
        <div>test</div>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
        <Track.SetContext
          context={(prev: { userId: string }) => ({
            ...prev,
            test: true,
          })}
        />
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(clickFn).toHaveBeenNthCalledWith(1, clickParams, { ...context, test: true }, anyFn);
  });

  it("can set context using useTracker hook", async () => {
    const context = { userId: "id" };
    const newContext = { userId: "newId" };
    const clickParams = { a: 1 };

    const { result } = renderHook(() => useTracker(), {
      wrapper: ({ children }) => <Track.Provider initialContext={context}>{children}</Track.Provider>,
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
      <Track.Provider initialContext={context}>
        <Track.Click params={{ a: 1 }}>
          <button type="button">click</button>
        </Track.Click>
        <Track.PageView params={{ b: 1 }} />
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(pageViewFn).toHaveBeenCalledWith({ b: 1 }, { userId: "id", test: false }, anyFn);
    // expect context to have been updated in the pageViewFn
    expect(clickFn).toHaveReturnedWith({ userId: "id", test: true });
  });
});
