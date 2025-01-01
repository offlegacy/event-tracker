<p align='center'>
<img src='https://github.com/user-attachments/assets/1e417f4e-0f3a-4b56-8f6c-68188572421d' width=340 height=340 />
</p>


# logger
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/loggists/logger/blob/main/LICENSE) 
[![NPM badge](https://img.shields.io/npm/v/@loggists/logger?logo=npm)](https://www.npmjs.com/package/@loggists/logger) 

This package provides a simple integration with your analytics tool(e.g. Google Analytics, Amplitude) designed to handle various types of events and context management in your application. It is built with TypeScript, ensuring type safety and ease of integration.

## Why logger?
If you're developing a web service with various experiments and iterations, user event tracking and logging are essential. However, logging during frontend development can sometimes be a painful process.

We often experience our main business logic and logging logic getting intertwined, making the code bloated and harder to read. We also have to go through numerous files just to add a new parameter to log.

`logger` helps you track events with type-safe declarative APIs, and enhances your logging performance with batching.


## Main Features
1. Supports both declarative and imperative event tracking APIs, allowing developers to choose the style that best fits their needs.
2. Offers type-safe React components and hooks through the `createConfig` function.
3. Clearly defines a layer for injecting dependencies related to event-tracking tools.
4. Supports batching options for efficient and performant data transmission.
   
## Install
Using npm:

```bash
$ npm install @loggists/logger
```

Using yarn:
```bash
$ yarn add @loggists/logger
```

Using pnpm:
```bash
$ pnpm add @loggists/logger
```

## Example with react-ga4

#### logger.ts
```tsx
import ReactGA from "react-ga4";
import { createLogger } from "@loggists/logger";
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
  },
  impression: {
    onImpression: (params, context) => {
      ReactGA.event({
        ...params,
        ...context,
        action: "impression",
      });
    },
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
      <h1>Logger</h1>
      <div className="card">
        <Log.Click
          params={{ category: "button", label: "count", value: count + 1 }}
        >
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </Log.Click>
      </div>
      <Log.Impression
        params={{ category: "text", label: "Log your way!" }}
      >
         <div>Log your way!</div>
      </Log.Impression>
      <Log.PageView page="/home" />
    </Log.Provider>
  );
}

export default App;

```

## Docs
- [API](./docs/api.md)
- [Components](./docs/components.md)
- [Hook](./docs/hook.md)
- [Batching](./docs/batching.md)
