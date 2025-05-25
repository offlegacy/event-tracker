import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { createTracker } from "../tracker";

import { sleep } from "./utils";

describe("enabled condition", () => {
  const mockSend = vi.fn();
  const mockOnClick = vi.fn();

  const [Track] = createTracker({
    send: mockSend,
    DOMEvents: {
      onClick: mockOnClick,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("boolean enabled", () => {
    it("should track when enabled is true", async () => {
      const page = render(
        <Track.Provider>
          <Track.Click enabled={true} params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).toHaveBeenCalledWith({ action: "test_click" }, {}, expect.any(Function));
    });

    it("should not track when enabled is false", async () => {
      const page = render(
        <Track.Provider>
          <Track.Click enabled={false} params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should track by default when enabled is not provided", async () => {
      const page = render(
        <Track.Provider>
          <Track.Click params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).toHaveBeenCalledWith({ action: "test_click" }, {}, expect.any(Function));
    });
  });

  describe("function enabled", () => {
    it("should track when function returns true", async () => {
      const enabledCondition = vi.fn().mockReturnValue(true);

      const page = render(
        <Track.Provider>
          <Track.Click enabled={enabledCondition} params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(enabledCondition).toHaveBeenCalledWith({}, { action: "test_click" });
      expect(mockOnClick).toHaveBeenCalledWith({ action: "test_click" }, {}, expect.any(Function));
    });

    it("should not track when function returns false", async () => {
      const enabledCondition = vi.fn().mockReturnValue(false);

      const page = render(
        <Track.Provider>
          <Track.Click enabled={enabledCondition} params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(enabledCondition).toHaveBeenCalledWith({}, { action: "test_click" });
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should handle function parameters with context", async () => {
      const enabledCondition = vi.fn().mockReturnValue(true);
      const initialContext = { user: { id: "123", isLoggedIn: true } };

      const page = render(
        <Track.Provider initialContext={initialContext}>
          <Track.Click
            enabled={enabledCondition}
            params={(context: any) => ({ action: "test_click", userId: context.user.id })}
          >
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(enabledCondition).toHaveBeenCalledWith(initialContext, { action: "test_click", userId: "123" });
      expect(mockOnClick).toHaveBeenCalledWith(
        { action: "test_click", userId: "123" },
        initialContext,
        expect.any(Function),
      );
    });

    it("should handle errors in enabled function gracefully", async () => {
      const enabledCondition = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const page = render(
        <Track.Provider>
          <Track.Click enabled={enabledCondition} params={{ action: "test_click" }}>
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(consoleSpy).toHaveBeenCalledWith("Enabled condition evaluation failed:", expect.any(Error));
      expect(mockOnClick).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("context-dependent scenarios", () => {
    it("should use context in enabled condition", async () => {
      const initialContext = { user: { isLoggedIn: false } };

      const page = render(
        <Track.Provider initialContext={initialContext}>
          <Track.Click
            enabled={(context: any, params: any) => {
              // Check both context and params
              return context.user.isLoggedIn && params.action === "test_click";
            }}
            params={{ action: "test_click" }}
          >
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should track when context condition is met", async () => {
      const initialContext = { user: { isLoggedIn: true } };

      const page = render(
        <Track.Provider initialContext={initialContext}>
          <Track.Click
            enabled={(context: any, params: any) => {
              // Check both context and params
              return context.user.isLoggedIn && params.action === "test_click";
            }}
            params={{ action: "test_click" }}
          >
            <button>Click me</button>
          </Track.Click>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).toHaveBeenCalledWith({ action: "test_click" }, initialContext, expect.any(Function));
    });

    it("should work with user authentication scenario", async () => {
      const mockUserEvent = vi.fn();
      const [UserTracker] = createTracker({
        DOMEvents: {
          onClick: mockUserEvent,
        },
      });

      const userContext = { user: { role: "admin", isAuthenticated: true } };

      const page = render(
        <UserTracker.Provider initialContext={userContext}>
          <UserTracker.Click
            enabled={(context: any) => context.user.isAuthenticated && context.user.role === "admin"}
            params={{ action: "admin_action" }}
          >
            <button>Admin Action</button>
          </UserTracker.Click>
        </UserTracker.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockUserEvent).toHaveBeenCalledWith({ action: "admin_action" }, userContext, expect.any(Function));
    });
  });

  describe("component integration", () => {
    it("should work with DOMEvent component", async () => {
      const page = render(
        <Track.Provider>
          <Track.DOMEvent type="onClick" enabled={false} params={{ action: "dom_click" }}>
            <button>Click me</button>
          </Track.DOMEvent>
        </Track.Provider>,
      );

      const button = page.getByRole("button");
      button.click();

      // Wait for async operations
      await sleep(0);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should work with Impression component", () => {
      const mockOnImpression = vi.fn();
      const [ImpressionTracker] = createTracker({
        impression: {
          onImpression: mockOnImpression,
        },
      });

      render(
        <ImpressionTracker.Provider>
          <ImpressionTracker.Impression enabled={false} params={{ page: "test" }}>
            <div>Test content</div>
          </ImpressionTracker.Impression>
        </ImpressionTracker.Provider>,
      );

      // Impression component would normally trigger, but should be disabled
      expect(mockOnImpression).not.toHaveBeenCalled();
    });

    it("should work with PageView component", () => {
      const mockOnPageView = vi.fn();
      const [PageTracker] = createTracker({
        pageView: {
          onPageView: mockOnPageView,
        },
      });

      render(
        <PageTracker.Provider>
          <PageTracker.PageView enabled={false} params={{ page: "home" }} />
        </PageTracker.Provider>,
      );

      expect(mockOnPageView).not.toHaveBeenCalled();
    });
  });
});
