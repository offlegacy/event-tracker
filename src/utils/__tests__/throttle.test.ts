import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle, type ThrottleConfig } from "../throttle";

// Helper function to wait for a specific amount of time
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
