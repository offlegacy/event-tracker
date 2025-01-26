<p align='center'>
<img src='https://github.com/user-attachments/assets/1e417f4e-0f3a-4b56-8f6c-68188572421d' width=340 height=340 />
</p>


# event-tracker
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/offlegacy/event-tracker/blob/main/LICENSE) 
[![NPM badge](https://img.shields.io/npm/v/@offlegacy/event-tracker?logo=npm)](https://www.npmjs.com/package/@offlegacy/event-tracker) 

A lightweight, type-safe event tracking library for React applications that simplifies analytics integration while maintaining clean code and optimal performance.

## Key Features
- 🎯 Declarative event tracking with type-safe APIs
- ⚡️ Optimized performance with event batching
- 🔄 Guaranteed execution order for async operations  
- 🔌 Analytics tool agnostic - works with any provider
- 🧩 Clean separation of tracking logic from business logic


## Why event-tracker?
Event tracking is essential for modern web applications, but implementing it cleanly can be challenging. Common pain points include:

- Mixing tracking logic with business logic
- Managing complex tracking state
- Ensuring reliable event delivery
- Maintaining type safety
- Performance overhead

`event-tracker` solves these problems with a declarative API that keeps your code clean and performant.
   
## Install
Using npm:

```bash
$ npm install @offlegacy/event-tracker
```

Using yarn:
```bash
$ yarn add @offlegacy/event-tracker
```

Using pnpm:
```bash
$ pnpm add @offlegacy/event-tracker
```

## Example with react-ga4

#### tracker.ts
```tsx
import ReactGA from "react-ga4";
import { createTracker } from "@offlegacy/event-tracker";
import { SendParams, EventParams, GAContext, ImpressionParams, PageViewParams } from "./types";

export const [Track, useTracker] = createTracker<GAContext, SendParams, EventParams, ImpressionParams, PageViewParams>({
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
import { Track } from "./tracker";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Track.Provider
      initialContext={{ userId: "USERID", clientId: "CLIENTID" }}
    >
      <h1>Event Tracker</h1>
      <div className="card">
        <Track.Click
          params={{ category: "button", label: "count", value: count + 1 }}
        >
          <button onClick={() => setCount((count) => count + 1)} >
            count is {count}
          </button>
        </Track.Click>
      </div>
      <Track.Impression
        params={{ category: "text", label: "Good morning" }}
      >
         <div>Good morning</div>
      </Track.Impression>
      <Track.PageView params={{page: "/home"}} />
    </Track.Provider>
  );
}
```
