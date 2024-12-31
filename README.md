<p align='center'>
<img src='https://github.com/user-attachments/assets/1e417f4e-0f3a-4b56-8f6c-68188572421d' width=340 height=340 />
</p>


# logguer
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/toss/slash/blob/main/LICENSE) 
[![NPM badge](https://img.shields.io/npm/v/logguer?logo=npm)](https://www.npmjs.com/package/logguer) 

This package provides a flexible and extensible analytics logging system(e.g. GA, Amplitude) designed to handle various types of events and context management in your application. It is built with TypeScript, ensuring type safety and ease of integration.

## Main Features
1. Supports both declarative and imperative APIs, allowing developers to choose the style that best fits their needs.
2. Offers type-safe React components and hooks through the `createConfig` function.
3. Clearly defines a layer for injecting dependencies related to analytics tools.

## Installing
Using npm:

```bash
$ npm install react-analytics-logger
```

Using yarn:
```bash
$ yarn add react-analytics-logger
```

Using pnpm:
```bash
$ pnpm add react-analytics-logger
```

## Example with react-ga4

#### logger.ts
```tsx
import ReactGA from "react-ga4";
import { createLogger } from "react-analytics-logger";
import { SendParams, EventParams, GAContext, ImpressionParams, PageViewParams } from "./types";

export const [Log, useLog] = createLogger<GAContext, SendParams, EventParams, ImpressionParams, PageViewParams>({
  init: () => {
    ReactGA.initialize("(your-ga-id)");
  },
  send: (params, context) => {
    const { hitType, ...rest } = params;
      ReactGA.send({
        hitType,
        ...rest,
      });
  },
  events: {
    onClick: (params, context) => {
      ReactGA.event({
        ...params,
        ...context,
        action: "click",
      });
    },
    onFocus: (params, context) => {
      ReactGA.event({
        ...params,
        ...context,
        action: "focus",
      });
    },
  },
  impression: {
    onImpression: (params, context) => {
      ReactGA.event({
        ...params,
        ...context,
        action: "impression",
      });
    },
    options:{
      threshold: 0.5,
    }
  },
  pageView: {
    onView: ({ page }) => {
      ReactGA.send({
        hitType: "pageview",
        page,
      });
    },
  },
});

```


#### App.tsx
```tsx
import { useState } from "react";
import { Log } from "./logger";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Log.Provider
      initialContext={{ userId: "USERID", clientId: "CLIENTID" }}
    >
      <h1>React Analytics Logger</h1>
      <div className="card">
        <Log.Click
          params={{ category: "test", label: "count", value: count + 1 }}
        >
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </Log.Click>
      </div>
      <Log.Event type="onFocus" params={{ category: "test", label: "my-input" }}>
          <input />
      </Log.Event>
      <Log.PageView page="/home" />
    </Log.Provider>
  );
}

export default App;

```
