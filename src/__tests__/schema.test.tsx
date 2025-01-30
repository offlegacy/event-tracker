import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { z } from "zod";

import { createTracker } from "..";

import { sleep } from "./utils";

const initFn = vi.fn();
const clickFn = vi.fn();
const schemaErrorFn = vi.fn();

const anyFn = expect.any(Function);

const [Track, useTracker] = createTracker({
  init: initFn,
  DOMEvents: {
    onClick: clickFn,
  },
  schema: {
    schemas: {
      test_button_click: z
        .object({
          text: z.string(),
        })
        .strict(),
    },
    onSchemaError: schemaErrorFn,
  },
});

describe("schemas", async () => {
  it("can validate schema based on the schema defined in config", async () => {
    const page = render(
      <Track.Provider>
        <Track.Click schema="test_button_click" params={{ text: "click" }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(clickFn).toHaveBeenCalledWith({ text: "click" }, {}, anyFn);
  });

  it("can validate schema with 'trackWithSchema'", async () => {
    const { result } = renderHook(() => useTracker(), { wrapper: Track.Provider });
    result.current.trackWithSchema.onClick({ schema: "test_button_click", params: { text: "click" } });
    await sleep(1);
    expect(clickFn).toHaveBeenCalledWith({ text: "click" }, {}, anyFn);
  });

  it("throws error when schema is not defined in config", async () => {
    const page = render(
      <Track.Provider>
        {/* @ts-expect-error */}
        <Track.Click schema="test_button_click" params={{ text: "click", userId: "123" }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(schemaErrorFn).toHaveBeenCalledWith(expect.any(z.ZodError));
  });
});
