import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTracker } from "../tracker";
import { throttle } from "../utils/throttle";

import { sleep, anyFn, createSchema, isString, isObject } from "./utils";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("basic throttling behavior", () => {
    it("should execute function immediately on first call (leading: true)", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should not execute function within the delay period", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn("arg1");
      throttledFn("arg2");
      throttledFn("arg3");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");
    });

    it("should execute function again after delay period", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      throttledFn("arg2");
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg2");
    });
  });

  describe("leading edge configuration", () => {
    it("should execute immediately when leading: true (default)", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: true });

      throttledFn("test");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should not execute immediately when leading: false", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: false });

      throttledFn("test");
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should execute after delay when leading: false", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: false });

      throttledFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should execute after delay when leading: false", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: false, trailing: true });

      throttledFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });
  });

  describe("trailing edge configuration", () => {
    it("should not execute trailing by default (trailing: false)", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn("arg1");
      throttledFn("arg2");
      throttledFn("arg3");

      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should execute trailing when trailing: true", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      throttledFn("arg1");
      throttledFn("arg2");
      throttledFn("arg3");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg3");
    });

    it("should execute both leading and trailing when both are true", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: true, trailing: true });

      throttledFn("arg1");
      throttledFn("arg2");
      throttledFn("arg3");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg1");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg3");
    });
  });

  describe("cancel method", () => {
    it("should cancel pending execution", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      throttledFn("arg1");
      throttledFn("arg2");

      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // No trailing execution
    });

    it("should reset throttle state after cancel", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn.cancel();

      // Should execute immediately again after cancel
      throttledFn("arg2");
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith("arg2");
    });
  });

  describe("flush method", () => {
    it("should immediately execute pending trailing call", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      throttledFn("arg1");
      throttledFn("arg2");

      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg2");
    });

    it("should do nothing if no pending call", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100 });

      throttledFn.flush();
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should prevent normal timer execution after flush", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      throttledFn("arg1");
      throttledFn("arg2");

      throttledFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // No additional call
    });
  });

  describe("edge cases", () => {
    it("should handle multiple rapid calls correctly", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      // Rapid calls
      for (let i = 0; i < 10; i++) {
        throttledFn(`arg${i}`);
      }

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg0");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "arg9"); // Last argument
    });

    it("should work with async functions", async () => {
      const asyncFn = vi.fn().mockResolvedValue("result");
      const throttledFn = throttle(asyncFn, { delay: 100 });

      throttledFn("test");
      expect(asyncFn).toHaveBeenCalledTimes(1);

      throttledFn("test2");
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it("should maintain correct argument order", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, trailing: true });

      throttledFn("a", "b", "c");
      throttledFn("x", "y", "z");

      expect(mockFn).toHaveBeenCalledWith("a", "b", "c");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenNthCalledWith(2, "x", "y", "z");
    });
  });

  describe("timing precision", () => {
    it("should respect exact delay timing", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 50 });

      throttledFn("first");
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Just before delay
      vi.advanceTimersByTime(49);
      throttledFn("second");
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Exactly at delay
      vi.advanceTimersByTime(1);
      throttledFn("third");
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "third");
    });
  });

  describe("configuration edge cases", () => {
    it("should handle leading: false, trailing: false", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 100, leading: false, trailing: false });

      throttledFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should handle zero delay", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, { delay: 0 });

      throttledFn("test1");
      throttledFn("test2");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test1");
    });
  });
});

describe("Throttle Integration Tests", () => {
  describe("useTracker API with ThrottleOptions", () => {
    it("should work without throttle options (backward compatibility)", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
      });

      function TestComponent() {
        const { track } = useTracker();

        return (
          <button
            type="button"
            onClick={() => {
              track.onClick?.({ action: "test" });
            }}
          >
            Test Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Test Button");

      // Click multiple times
      button.click();
      button.click();
      button.click();

      // Delay to ensure async operations complete
      await sleep(0);

      // Should be called immediately for each click without throttle
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it("should support throttle options in track methods", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
      });

      function TestComponent() {
        const { track } = useTracker();

        return (
          <button
            type="button"
            onClick={() => {
              track.onClick?.({ action: "test" }, { throttle: { delay: 100 } });
            }}
          >
            Test Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Test Button");

      // Click multiple times rapidly
      button.click();
      button.click();
      button.click();

      // Add small delay for scheduler to process
      await sleep(0);

      // Should be called once immediately due to throttle (leading: true by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "test" }, {}, anyFn);

      await sleep(150); // Wait longer than throttle delay

      // Should still be called only once (no trailing by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should support throttle options in trackWithSchema methods", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
        batch: { enable: false },
        schema: {
          schemas: {
            clickSchema: createSchema((value: unknown): { action: string } => {
              if (!isObject(value)) {
                throw new Error("Expected object");
              }
              
              const { action } = value;
              
              if (!isString(action)) {
                throw new Error("action must be a string");
              }
              
              return { action };
            }),
          },
        },
      });

      function TestComponent() {
        const { trackWithSchema } = useTracker();

        return (
          <button
            type="button"
            onClick={() => {
              trackWithSchema.onClick?.(
                {
                  schema: "clickSchema",
                  params: { action: "schema_test" },
                },
                { throttle: { delay: 80, leading: true, trailing: true } },
              );
            }}
          >
            Schema Test Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Schema Test Button");

      // Click multiple times rapidly
      button.click();
      button.click();
      button.click();

      // Add small delay for scheduler to process
      await sleep(0);

      // Should be called once immediately (leading: true)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "schema_test" }, {}, anyFn);

      await sleep(100); // Wait longer than throttle delay

      // Should be called again (trailing: true)
      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, { action: "schema_test" }, {}, anyFn);
    });

    it("should support throttle with leading: false", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
      });

      function TestComponent() {
        const { track } = useTracker();

        return (
          <button
            type="button"
            onClick={() => {
              track.onClick?.({ action: "test" }, { throttle: { delay: 100, leading: false } });
            }}
          >
            Test Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Test Button");

      // Click once
      button.click();

      // Should not be called immediately (leading: false)
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(100); // Wait longer than throttle delay

      // Should be called once after delay
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "test" }, {}, anyFn);
    });
  });

  describe("Component Integration", () => {
    it("should use throttle in Click component", async () => {
      const mockOnClick = vi.fn();
      const [Track] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
        batch: { enable: false },
      });

      const page = render(
        <Track.Provider>
          <Track.Click params={{ action: "click_test" }} throttle={{ delay: 60 }}>
            <button>Click Test Button</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByText("Click Test Button");

      // Trigger click events rapidly
      button.click();
      button.click();
      button.click();

      // Add small delay for scheduler to process
      await sleep(0);

      // Should be called once immediately (leading: true by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "click_test" }, {}, anyFn);

      await sleep(80);

      // Should still be called only once (no trailing by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should use throttle in DOMEvent component", async () => {
      const mockOnClick = vi.fn();
      const [Track] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
        batch: { enable: false },
      });

      const page = render(
        <Track.Provider>
          <Track.DOMEvent type="onClick" params={{ action: "click_test" }} throttle={{ delay: 60, trailing: true }}>
            <button>Click Test Button</button>
          </Track.DOMEvent>
        </Track.Provider>,
      );

      const button = page.getByText("Click Test Button");

      // Trigger click events rapidly
      button.click();
      button.click();
      button.click();

      // Add small delay for scheduler to process
      await sleep(0);

      // Should be called once immediately (leading: true by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "click_test" }, {}, anyFn);

      await sleep(80);

      // Should be called again due to trailing: true
      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, { action: "click_test" }, {}, anyFn);
    });

    it("should work without throttle in components", async () => {
      const mockOnClick = vi.fn();
      const [Track] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
      });

      const page = render(
        <Track.Provider>
          <Track.Click params={{ action: "no_throttle" }}>
            <button>No Throttle Button</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByText("No Throttle Button");

      // Click multiple times
      button.click();
      button.click();

      // Small delay for async operations
      await sleep(0);

      // Should be called immediately for each click
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Throttle Instance Caching", () => {
    it("should reuse throttle instances for same configuration", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
      });

      let trackerRef: any;

      function TestComponent() {
        const tracker = useTracker();
        trackerRef = tracker;
        return <div>Test</div>;
      }

      render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const throttleConfig = { delay: 100 };

      // Call with same config multiple times
      trackerRef.track.onClick?.({ action: "test1" }, { throttle: throttleConfig });
      trackerRef.track.onClick?.({ action: "test2" }, { throttle: throttleConfig });
      trackerRef.track.onClick?.({ action: "test3" }, { throttle: throttleConfig });

      // Add small delay for scheduler to process
      await sleep(0);

      // Should execute the first call immediately (leading: true by default)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "test1" }, {}, anyFn);

      await sleep(120);

      // Should still be called only once due to throttling
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should create separate instances for different configurations", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
      });

      let trackerRef: any;

      function TestComponent() {
        const tracker = useTracker();
        trackerRef = tracker;
        return <div>Test</div>;
      }

      render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      // Call with different throttle configs
      trackerRef.track.onClick?.({ action: "config1" }, { throttle: { delay: 50 } });
      trackerRef.track.onClick?.({ action: "config2" }, { throttle: { delay: 100 } });

      // Add small delay for scheduler to process
      await sleep(0);

      // Both should execute immediately (different throttle instances)
      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, { action: "config1" }, {}, anyFn);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, { action: "config2" }, {}, anyFn);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle mixed throttled and non-throttled calls", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
      });

      let trackerRef: any;

      function TestComponent() {
        const tracker = useTracker();
        trackerRef = tracker;
        return <div>Test</div>;
      }

      render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      // Mix throttled and non-throttled calls
      trackerRef.track.onClick?.({ action: "immediate1" }); // No throttle
      trackerRef.track.onClick?.({ action: "throttled" }, { throttle: { delay: 100 } });
      trackerRef.track.onClick?.({ action: "immediate2" }); // No throttle

      // Small delay for immediate calls
      await sleep(0);

      // All three should execute (2 immediate + 1 throttled leading)
      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, { action: "immediate1" }, {}, anyFn);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, { action: "throttled" }, {}, anyFn);
      expect(mockOnClick).toHaveBeenNthCalledWith(3, { action: "immediate2" }, {}, anyFn);
    });

    it("should handle impression events with throttle", async () => {
      const mockOnImpression = vi.fn();
      const [Track, useTracker] = createTracker({
        impression: {
          onImpression: (params, context, setContext) => {
            mockOnImpression(params, context, setContext);
          },
        },
      });

      let trackerRef: any;

      function TestComponent() {
        const tracker = useTracker();
        trackerRef = tracker;
        return <div>Test</div>;
      }

      render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      // Call impression with throttle
      trackerRef.track.onImpression?.({ section: "hero" }, { throttle: { delay: 80 } });
      trackerRef.track.onImpression?.({ section: "hero" }, { throttle: { delay: 80 } });

      // Add small delay for scheduler to process
      await sleep(0);

      // Should be called once immediately due to throttle (leading: true by default)
      expect(mockOnImpression).toHaveBeenCalledTimes(1);
      expect(mockOnImpression).toHaveBeenCalledWith({ section: "hero" }, {}, anyFn);

      await sleep(100);

      // Should still be called only once (no trailing by default)
      expect(mockOnImpression).toHaveBeenCalledTimes(1);
    });

    it("should prioritize debounce when both debounce and throttle are specified", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
      });

      let trackerRef: any;

      function TestComponent() {
        const tracker = useTracker();
        trackerRef = tracker;
        return <div>Test</div>;
      }

      render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      // When both are specified, debounce should take precedence (based on if/else if logic)
      trackerRef.track.onClick?.(
        { action: "both_specified" },
        {
          debounce: { delay: 200 },
          throttle: { delay: 100 },
        },
      );

      // Should not execute immediately (debounce behavior)
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(250); // Wait longer than debounce delay

      // Should execute after debounce delay
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "both_specified" }, {}, anyFn);
    });
  });
});
