<p align='center'>
<img src='https://github.com/user-attachments/assets/1e417f4e-0f3a-4b56-8f6c-68188572421d' width=340 height=340 />
</p>

# event-tracker &middot; [![MIT License](https://img.shields.io/github/license/offlegacy/event-tracker?color=blue)](https://github.com/offlegacy/event-tracker/blob/main/LICENSE) [![NPM Version](https://img.shields.io/npm/v/%40offlegacy%2Fevent-tracker)](https://www.npmjs.com/package/@offlegacy/event-tracker)

> Focus on _what_ to track, not _how_ to track it!

A comprehensive solution for event tracking in React applications. Separate tracking logic from business logic with declarative, type-safe APIs.


## Installation

To install the `event-tracker` library, you can use npm or yarn. Run one of the following commands in your project directory:

Using npm:
```bash
npm install @offlegacy/event-tracker
```

Using yarn:
```bash
yarn add @offlegacy/event-tracker
```

Using pnpm:
```bash
pnpm install @offlegacy/event-tracker
```

## What is Event Tracker?

Event Tracker is a declarative React library that simplifies the process of implementing complex event tracking, allowing developers to focus more on business logic. It is designed to make event tracking easy and efficient for applications of any scale.

```tsx
import { createTracker } from "@offlegacy/event-tracker";

// Create a tracker instance
const [Track, useTracker] = createTracker({
  DOMEvents: {
    onClick: (params, context) => {
      log("Click event:", params, context);
    },
  },
});

// Usage in the app
function App() {
  return (
    <Track.Provider initialContext={{ userId: "userId-123" }}>
      <Track.Click params={{ buttonId: "event-click" }}>
        <button>Event Click!</button>
      </Track.Click>
    </Track.Provider>
  );
}
```

### Key Features

Event Tracker provides a wide range of features focused on both developer experience and application performance.

| Feature                      | Description                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declarative API              | Easily declare tracking as components without additional setup or complex code.                                                                                     |
| Analytics Tool Agnostic      | Integrate with any tool such as [Google Analytics](https://analytics.google.com/) or [Amplitude](https://amplitude.com/) without modifying existing infrastructure. |
| Clear Separation of Concerns | Keep tracking logic completely separate from business code, improving readability, testability, and maintainability.                                                |
| Optimized Performance        | Built-in strategies like batching, debouncing, and throttling minimize network requests, enabling stable tracking without performance degradation.                  |
| Guaranteed Execution Order   | Ensures events are processed in the intended order even in asynchronous scenarios, enabling accurate tracking in complex user flows.                                |
| Data Validation              | Schema validation with [standard-schema](https://github.com/standard-schema/standard-schema) prevents build-time errors and ensures the reliability of collected event data.                      |

## Core Concepts

To use Event Tracker effectively, there are several key concepts to understand.

### Instance (`createTracker`)

This is the fundamental starting point of the library. Using the `createTracker` function, you create a tracker instance (a collection of `Track` components and the `useTracker` hook). Here, you define event tracking by configuring DOM event handlers, impression handlers, and schemas.

You can create multiple tracker instances for different purposes (for example, one for Google Analytics and another for Amplitude).

### Provider (`Track.Provider`)

Implemented based on React’s Context API. Wrap the top level of your application or a specific component tree with `Track.Provider` to supply common data (context) needed for tracking to child components. For example, passing `userId` or `pageName` as context allows these values to be used during event tracking.

### Event Components (`Track.Click`, `Track.PageView`, etc.)

These are special components that enable declarative event tracking. They are provided as the first element in the array returned by `createTracker`.

- `Track.Click`: Tracks when a click event occurs on child elements.
- `Track.Impression`: Tracks when child elements are displayed on screen.
- `Track.PageView`: Tracks a page view event when the component mounts.

You can use the provided components or create custom ones to handle various user interactions and lifecycle events. Each component accepts `context` and `params` props to pass specific data relevant to the event.

### Custom Hook

Use when you need more complex or conditional event tracking that is not directly tied to component lifecycle or DOM events. The hook allows you to access context from `Track.Provider` and execute defined tracking logic imperatively.

## Visit [official documentation](https://event-tracker.offlegacy.org/)

Visit the [official documentation](https://event-tracker.offlegacy.org/) for detailed information on installation, usage, and more.

## Contributing

We welcome contribution from everyone in the community. Read for detailed [contribution guide](https://github.com/offlegacy/event-tracker/blob/main/CONTRIBUTING.md).

[![contributors](https://contrib.rocks/image?repo=offlegacy/event-tracker)](https://github.com/offlegacy/event-tracker/contributors)

## License

See [LICENSE](https://github.com/offlegacy/event-tracker/blob/main/LICENSE) for more information.

MIT © [OffLegacy](https://www.offlegacy.org/)
