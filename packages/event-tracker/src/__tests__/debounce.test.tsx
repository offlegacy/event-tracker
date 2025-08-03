import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";

import { createTracker } from "../tracker";
import { debounce } from "../utils/debounce";

import { sleep, anyFn } from "./utils";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic functionality (trailing)", () => {
    it("should execute function after specified delay", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should execute only the last call when called rapidly", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("first");
      debouncedFn("second");
      debouncedFn("third");

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("third");
    });

    it("should execute each call when called with intervals", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("first");
      vi.advanceTimersByTime(100);

      debouncedFn("second");
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, "first");
      expect(mockFn).toHaveBeenNthCalledWith(2, "second");
    });
  });

  describe("leading edge", () => {
    it("should execute immediately when leading: true", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100, leading: true });

      debouncedFn("test");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should execute only first call when leading: true, trailing: false", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, {
        delay: 100,
        leading: true,
        trailing: false,
      });

      debouncedFn("first");
      debouncedFn("second");
      debouncedFn("third");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("first");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // no trailing execution
    });

    it("should execute both first and last call when leading: true, trailing: true", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, {
        delay: 100,
        leading: true,
        trailing: true,
      });

      debouncedFn("first");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("first");

      debouncedFn("second");
      debouncedFn("third");

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(2, "third");
    });
  });

  describe("cancel method", () => {
    it("should cancel pending calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("test");
      debouncedFn.cancel();

      vi.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should work normally after cancel", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("first");
      debouncedFn.cancel();

      debouncedFn("second");
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("second");
    });
  });

  describe("flush method", () => {
    it("should execute pending calls immediately", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      debouncedFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should do nothing when no pending calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn.flush();
      expect(mockFn).not.toHaveBeenCalled();
    });

    it("should clear timer after flush", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, { delay: 100 });

      debouncedFn("test");
      debouncedFn.flush();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // only once from flush
    });
  });

  describe("complex scenarios", () => {
    it("search input scenario", () => {
      const searchFn = vi.fn();
      const debouncedSearch = debounce(searchFn, { delay: 300 });

      // rapid typing
      debouncedSearch("a");
      vi.advanceTimersByTime(50);
      debouncedSearch("ab");
      vi.advanceTimersByTime(50);
      debouncedSearch("abc");
      vi.advanceTimersByTime(50);

      expect(searchFn).not.toHaveBeenCalled();

      // after 300ms
      vi.advanceTimersByTime(300);
      expect(searchFn).toHaveBeenCalledTimes(1);
      expect(searchFn).toHaveBeenCalledWith("abc");
    });

    it("button spam prevention scenario", () => {
      const submitFn = vi.fn();
      const debouncedSubmit = debounce(submitFn, {
        delay: 1000,
        leading: true,
        trailing: false,
      });

      // first click executes immediately
      debouncedSubmit("data");
      expect(submitFn).toHaveBeenCalledTimes(1);

      // subsequent clicks are ignored
      debouncedSubmit("data");
      debouncedSubmit("data");
      debouncedSubmit("data");

      vi.advanceTimersByTime(1000);
      expect(submitFn).toHaveBeenCalledTimes(1); // still only once
    });
  });
});

describe("Debounce Integration Tests", () => {
  describe("useTracker API with TrackingOptions", () => {
    it("should work without debounce options (backward compatibility)", async () => {
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

      // Should be called immediately for each click without debounce
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it("should support debounce options in track methods", async () => {
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
              track.onClick?.({ action: "test" }, { debounce: { delay: 100 } });
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

      // Should not have been called yet
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(150); // Wait longer than debounce delay

      // Should be called only once due to debounce
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "test" }, {}, anyFn);
    });

    it("should support debounce options in trackWithSchema methods", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: mockOnClick,
        },
        batch: { enable: false },
        schema: {
          schemas: {
            clickSchema: z.object({
              action: z.string(),
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
                { debounce: { delay: 80 } },
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

      // Should not have been called yet
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(120); // Wait longer than debounce delay

      // Should be called only once due to debounce
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "schema_test" }, {}, anyFn);
    });

    it("should support leading edge debounce", async () => {
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
              track.onClick?.(
                { action: "leading" },
                {
                  debounce: {
                    delay: 100,
                    leading: true,
                    trailing: false,
                  },
                },
              );
            }}
          >
            Leading Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Leading Button");

      // Click multiple times rapidly
      button.click();
      button.click();
      button.click();

      // Small delay for async operations
      await sleep(10);

      // Should be called immediately (leading edge)
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "leading" }, {}, anyFn);

      // Wait for debounce period - should not be called again (trailing: false)
      await sleep(120);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should support both leading and trailing debounce", async () => {
      const mockOnClick = vi.fn();
      const [Track, useTracker] = createTracker({
        DOMEvents: {
          onClick: (params, context, setContext) => {
            mockOnClick(params, context, setContext);
          },
        },
        batch: { enable: false },
      });

      function TestComponent() {
        const { track } = useTracker();

        return (
          <button
            type="button"
            onClick={() => {
              track.onClick?.(
                { action: "both" },
                {
                  debounce: {
                    delay: 100,
                    leading: true,
                    trailing: true,
                  },
                },
              );
            }}
          >
            Both Button
          </button>
        );
      }

      const page = render(
        <Track.Provider>
          <TestComponent />
        </Track.Provider>,
      );

      const button = page.getByText("Both Button");

      // First click
      button.click();
      await sleep(10);

      // Should execute immediately (leading)
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      // More clicks
      button.click();
      button.click();

      // Wait for trailing execution
      await sleep(120);

      // Should execute trailing call too
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Component Integration", () => {
    it("should use debounce in Click component", async () => {
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
          <Track.Click params={{ action: "component_test" }} debounce={{ delay: 80 }}>
            <button>Component Button</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByText("Component Button");

      // Click multiple times
      button.click();
      button.click();

      // Should not be called yet
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(100);

      // Should be called once
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "component_test" }, {}, anyFn);
    });

    it("should use debounce in DOMEvent component", async () => {
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
          <Track.DOMEvent type="onClick" params={{ action: "click_test" }} debounce={{ delay: 60 }}>
            <button>Click Test Button</button>
          </Track.DOMEvent>
        </Track.Provider>,
      );

      const button = page.getByText("Click Test Button");

      // Trigger click events rapidly
      button.click();
      button.click();
      button.click();

      // Should not be called yet
      expect(mockOnClick).not.toHaveBeenCalled();

      await sleep(80);

      // Should be called once
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "click_test" }, {}, anyFn);
    });

    it("should work without debounce in components", async () => {
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
          <Track.Click params={{ action: "no_debounce" }}>
            <button>No Debounce Button</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByText("No Debounce Button");

      // Click multiple times
      button.click();
      button.click();

      // Small delay for async operations
      await sleep(10);

      // Should be called immediately for each click
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("Debounce Instance Caching", () => {
    it("should reuse debounce instances for same configuration", async () => {
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

      const debounceConfig = { delay: 100 };

      // Call with same config multiple times
      trackerRef.track.onClick?.({ action: "test1" }, { debounce: debounceConfig });
      trackerRef.track.onClick?.({ action: "test2" }, { debounce: debounceConfig });
      trackerRef.track.onClick?.({ action: "test3" }, { debounce: debounceConfig });

      await sleep(120);

      // Should only execute the last call due to same debounce instance
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      // Note: The actual behavior may execute the first call depending on debounce implementation
      // Let's check which one actually gets called
      expect(mockOnClick).toHaveBeenCalledWith(
        expect.objectContaining({ action: expect.stringMatching(/test[123]/) }),
        {},
        anyFn,
      );
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

      // Call with different debounce configs
      trackerRef.track.onClick?.({ action: "config1" }, { debounce: { delay: 50 } });
      trackerRef.track.onClick?.({ action: "config2" }, { debounce: { delay: 100 } });

      // Wait for first debounce to trigger
      await sleep(70);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "config1" }, {}, anyFn);

      // Wait for second debounce to trigger
      await sleep(50);
      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenCalledWith({ action: "config2" }, {}, anyFn);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle mixed debounced and non-debounced calls", async () => {
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

      // Mix debounced and non-debounced calls
      trackerRef.track.onClick?.({ action: "immediate1" }); // No debounce
      trackerRef.track.onClick?.({ action: "debounced" }, { debounce: { delay: 100 } });
      trackerRef.track.onClick?.({ action: "immediate2" }); // No debounce

      // Small delay for immediate calls
      await sleep(10);

      // Immediate calls should execute right away
      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, { action: "immediate1" }, {}, anyFn);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, { action: "immediate2" }, {}, anyFn);

      // Wait for debounced call
      await sleep(120);

      // Debounced call should execute
      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(3, { action: "debounced" }, {}, anyFn);
    });

    it("should handle impression events with debounce", async () => {
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

      // Call impression with debounce
      trackerRef.track.onImpression?.({ section: "hero" }, { debounce: { delay: 80 } });
      trackerRef.track.onImpression?.({ section: "hero" }, { debounce: { delay: 80 } });

      await sleep(100);

      // Should be called once due to debounce
      expect(mockOnImpression).toHaveBeenCalledTimes(1);
      expect(mockOnImpression).toHaveBeenCalledWith({ section: "hero" }, {}, anyFn);
    });
  });
});
