## Provider

Use the `Provider` component to connect and provide initial context to your application.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({...})

function App() {
  return <Track.Provider initialContext={{}}>...</Track.Provider>
}
```

### props

- `initialContext: unknown`
  - The initial context value.

## DOMEvent

`DOMEvent` is used for tracking events with DOM elements. It wraps a single child component and fires the function specified for the event in `createTracker` config.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({
  DOMEvents:{
    onFocus:(params, context)=>{...}
  }
})

function App() {
  return (
    <Track.Provider initialContext={{}}>
      <Track.DOMEvent type="onFocus" params={{}}>
        <input />
      </Track.DOMEvent>
    </Track.Provider>
  );
}
```

### props

- `type: DOMEventNames`
  - The name of the event. (e.g. onClick, onFocus..,)
- `params: unknown`
  - The parameters used to track the event.

## Click

`Click` is the same as `DomEvent` with `type="onClick`.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({
  DOMEvents:{
    onClick:(params, context)=>{...}
  }
})

function App() {
  return (
    <Track.Provider initialContext={{}}>
      <Track.Click params={{}}>
        <button>Click Me</button>
      </Track.Click>
    </Track.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to track the event.

## Impression

`Impression` is used for tracking impression events. It wraps a single child component and fires the `onImpression` function specified in `createTracker` config.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({
  impression:{
    onImpression:(params, context)=>{...}
    options:{...}
  }
})

function App() {
  return (
    <Track.Provider initialContext={{}}>
      <Track.Impression params={{}} options={{}}>
        <input />
      </Track.Impression>
    </Track.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to track the event.
- `options: ImpressionOptions`
  - **optional**
  - If set, it will over override the options specified in `createTracker` config.

## PageView

`PageView` is used for tracking page view events. It fires the `onPageView` function specified in `createTracker` config when mounted.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({
  pageView:{
    onPageView:(params, context)=>{...}
  }
})

function App() {
  return (
    <Track.Provider initialContext={{}}>
      <Track.PageView params={{}}/>
    </Track.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to track the event.

## SetContext

`SetContext` is used to set or change the context. It will set the context when mounted.

```tsx
import { createTracker } from '@offlegacy/event-tracker'

const [Track] = createTracker({...})

function App() {
  return (
    <Track.Provider initialContext={{}}>
      <Track.SetContext context={{}}/>
    </Track.Provider>
  );
}
```

### props

- `context: unknown | ((prevContext: unknown) => unknown)`
  - The context to set.
