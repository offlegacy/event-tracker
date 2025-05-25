import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../debounce";

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
