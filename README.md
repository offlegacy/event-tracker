<p align='center'>
<img src='https://github.com/user-attachments/assets/1e417f4e-0f3a-4b56-8f6c-68188572421d' width=340 height=340 />
</p>


# logger
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/loggists/logger/blob/main/LICENSE) 
[![NPM badge](https://img.shields.io/npm/v/@loggists/logger?logo=npm)](https://www.npmjs.com/package/@loggists/logger) 

This package provides a simple integration with your analytics tool(e.g. Google Analytics, Amplitude) designed to handle various types of user events and context management in your React application. It is built with TypeScript, ensuring type safety and ease of integration.

## Main Features
1. Declarative user event tracking APIs
2. Ensures execution order in asynchronous event operations.
3. Batching options for efficient and performant data transmission.
4. Decouples your React application from analyitics tool.


## Why logger?
If you're developing a web service with various experiments and iterations, user event tracking and logging is essential. However, logging during frontend development can sometimes be a painful process.

Maybe you have to create a custom hook, integrate your logging logic with your state management logic, and deal with all the hassle, making your code messy and hard to maintain.

`logger` helps you track events with type-safe declarative APIs, and enhances your logging performance with batching.
   
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
  DOMEvents: {
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
          <button onClick={() => setCount((count) => count + 1)} >
            count is {count}
          </button>
        </Log.Click>
      </div>
      <Log.Impression
        params={{ category: "text", label: "Good morning" }}
      >
         <div>Good morning</div>
      </Log.Impression>
      <Log.PageView params={{page: "/home"}} />
    </Log.Provider>
  );
}

```

## Docs
- [API](./docs/api.md)
- [Components](./docs/components.md)
- [Hook](./docs/hook.md)
- [Batching](./docs/batching.md)
