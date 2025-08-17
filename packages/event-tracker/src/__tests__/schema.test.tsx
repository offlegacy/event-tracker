import { render, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { createTracker } from "..";

import { createSchema, isNumber, isObject, isString, sleep } from "./utils";

const initFn = vi.fn();
const clickFn = vi.fn();
const schemaErrorFn = vi.fn();

interface Context {
  userId: string;
}

interface Params {}

const schemas = {
  test_button_click: createSchema((value: unknown): { text: string; button_id: number } => {
    if (!isObject(value)) {
      throw new Error("Expected object");
    }

    const { text, button_id, ...rest } = value;

    // strict validation - no extra properties allowed
    if (Object.keys(rest).length > 0) {
      throw new Error(`Unexpected properties: ${Object.keys(rest).join(", ")}`);
    }

    if (!isString(text)) {
      throw new Error("text must be a string");
    }

    if (!isNumber(button_id)) {
      throw new Error("button_id must be a number");
    }

    return { text, button_id };
  }),
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

  it("validates schema and calls onSchemaError when validation fails", async () => {
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

    expect(schemaErrorFn).toHaveBeenCalledWith([{ message: "button_id must be a number" }]);
  });

  it("validates schema and rejects extra properties (strict mode)", async () => {
    const page = render(
      <Track.Provider initialContext={{ userId: "id" }}>
        {/* Extra property 'extra_field' should cause validation error */}
        {/* @ts-expect-error */}
        <Track.Click schema="test_button_click" params={{ text: "click", button_id: 2, extra_field: "invalid" }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(schemaErrorFn).toHaveBeenCalledWith([{ message: "Unexpected properties: extra_field" }]);
  });

  it("validates schema and rejects wrong types", async () => {
    const page = render(
      <Track.Provider initialContext={{ userId: "id" }}>
        {/* Wrong type for button_id (string instead of number) */}
        {/* @ts-expect-error */}
        <Track.Click schema="test_button_click" params={{ text: "click", button_id: "not_a_number" }}>
          <button type="button">click</button>
        </Track.Click>
      </Track.Provider>,
    );

    page.getByText("click").click();
    await sleep(1);

    expect(schemaErrorFn).toHaveBeenCalledWith([{ message: "button_id must be a number" }]);
  });
});
