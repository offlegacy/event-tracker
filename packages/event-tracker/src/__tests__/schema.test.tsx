import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { z } from "zod";

import { createTracker } from "..";

import { sleep } from "./utils";

const initFn = vi.fn();
const clickFn = vi.fn();
const schemaErrorFn = vi.fn();

interface Context {
  userId: string;
}

interface Params {}

const schemas = {
  test_button_click: z
    .object({
      text: z.string(),
      button_id: z.number(),
    })
    .strict(),
};

const [Track, useTracker] = createTracker<Context, Params, typeof schemas>({
  init: initFn,
  DOMEvents: {
    onClick: (params, context) => {
      clickFn({ ...params, userId: context.userId });
    },
  },
  schema: {
    schemas,
    onSchemaError: schemaErrorFn,
  },
});

describe("schemas", async () => {
  it("can validate schema based on the schema defined in config", async () => {
    const page = render(
      <Track.Provider initialContext={{ userId: "id" }}>
        <Track.Click schema="test_button_click" params={{ text: "click", button_id: 2 }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith({ text: "click", button_id: 2, userId: "id" });
  });

  it("can validate schema with 'trackWithSchema'", async () => {
    const { result } = renderHook(() => useTracker(), {
      wrapper: ({ children }) => Track.Provider({ children, initialContext: { userId: "id" } }),
    });
    result.current.trackWithSchema.onClick({ schema: "test_button_click", params: { text: "click", button_id: 2 } });
    await sleep(1);
    expect(clickFn).toHaveBeenCalledWith({ text: "click", button_id: 2, userId: "id" });
  });

  it("throws error when schema is not defined in config", async () => {
    const page = render(
      <Track.Provider initialContext={{ userId: "id" }}>
        {/* No 'button_id', so error expected */}
        {/* @ts-expect-error */}
        <Track.Click schema="test_button_click" params={{ text: "click" }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(schemaErrorFn).toHaveBeenCalled();
  });
});
