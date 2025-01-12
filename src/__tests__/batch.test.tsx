import { render } from "@testing-library/react";

import { createTracker } from "..";

import { anyFn, sleep } from "./utils";

const initFn = vi.fn();
const clickFn = vi.fn();
const flushFn = vi.fn();
const pageViewFn = vi.fn();
const FLUSH_INTERVAL = 500;

const [Track] = createTracker({
  init: initFn,
  DOMEvents: {
    onClick: clickFn,
  },
  pageView: {
    onPageView: pageViewFn,
  },
  batch: {
    enable: true,
    thresholdSize: 5,
    interval: FLUSH_INTERVAL,
    onFlush: flushFn,
  },
});

describe("batching behavior", () => {
  it("should flush the batch when the threshold size is reached", async () => {
    const clickParams = { a: 1 };

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );
    expect(flushFn).not.toHaveBeenCalled();

    clickFn.mockImplementation((params) => params);

    const button = page.getByText("click");

    button.click();

    expect(flushFn).not.toHaveBeenCalled();

    button.click();
    button.click();
    button.click();
    button.click();
    await sleep(1);

    expect(clickFn).toHaveBeenCalledTimes(5);
    expect(flushFn).toHaveBeenNthCalledWith(
      1,
      [clickParams, clickParams, clickParams, clickParams, clickParams],
      false,
    );
  });

  it("should flush the batch when the interval is reached", async () => {
    const clickParams = { a: 1 };

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    clickFn.mockImplementation((params) => params);

    const button = page.getByText("click");

    button.click();
    button.click();
    button.click();

    expect(flushFn).not.toHaveBeenCalled();

    await sleep(FLUSH_INTERVAL);

    expect(clickFn).toHaveBeenCalledTimes(3);
    expect(flushFn).toHaveBeenNthCalledWith(1, [clickParams, clickParams, clickParams], false);
  });

  it("should flush the batch when the page is unmounted", async () => {
    const clickParams = { a: 1 };

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    clickFn.mockImplementation((params) => params);

    const button = page.getByText("click");

    button.click();
    button.click();

    expect(flushFn).not.toHaveBeenCalled();

    await sleep(1);

    page.unmount();

    expect(flushFn).toHaveBeenNthCalledWith(1, [clickParams, clickParams], false);
  });

  it("should flush the batch when the browser is closed", async () => {
    const clickParams = { a: 1 };

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    clickFn.mockImplementation((params) => params);

    const button = page.getByText("click");

    button.click();
    button.click();
    await sleep(1);

    expect(flushFn).not.toHaveBeenCalled();

    document.dispatchEvent(new Event("beforeunload"));

    expect(flushFn).toHaveBeenCalledWith([clickParams, clickParams], true);
  });

  it("should wait for init function to be resolved before interval starts", async () => {
    const clickParams = { a: 1 };
    initFn.mockImplementationOnce(() => sleep(300));

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={clickParams}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    const button = page.getByText("click");
    button.click();
    button.click();

    // clickFn should not have been called yet
    expect(clickFn).not.toHaveBeenCalled();

    // wait for init function to be resolved
    await sleep(300);

    // clickFn should have been called now
    expect(clickFn).toHaveBeenCalledTimes(2);
    expect(flushFn).not.toHaveBeenCalled();

    // wait for interval
    await sleep(FLUSH_INTERVAL);

    // flushFn should have been called now
    expect(flushFn).toHaveBeenCalled();
  });
});

describe("event function race condition", () => {
  it("should assure the event function's order when the event function", async () => {
    const event1 = () => sleep(500);
    const event2 = () => sleep(300);

    pageViewFn.mockImplementationOnce(event1);
    clickFn.mockImplementationOnce(event2);

    const page = render(
      <Track.Provider initialContext={{}}>
        <Track.Click params={{ b: 1 }}>
          <button type="button">click</button>
        </Track.Click>
        <Track.PageView params={{ a: 1 }} />
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    // pageViewFn is not resolved yet. So, clickFn is not called yet.
    expect(pageViewFn).toHaveBeenCalled();
    expect(pageViewFn).not.toHaveResolved();
    expect(clickFn).not.toHaveBeenCalled();

    await sleep(500); // wait for pageViewFn to be resolved
    // pageViewFn is resolved now. So, clickFn is called now.
    expect(pageViewFn).toHaveResolved();
    expect(clickFn).toHaveBeenCalledWith({ b: 1 }, {}, anyFn);
    expect(clickFn).not.toHaveResolved();

    await sleep(300); // wait for clickFn to be resolved
    expect(clickFn).toHaveResolved();
  });
});
