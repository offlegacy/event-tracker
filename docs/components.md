## Provider

Use the `Provider` component to connect and provide a QueryClient to your application.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({...})

function App() {
  return <Log.Provider initialContext={{}}>...</Log.Provider>
}
```

### props

- `initialContext: unknown`
  - The initial context value.

## DOMEvent

`DOMEvent` is used for tracking events with DOM elements. It wraps a single child component and fires the function specified for the event in `createLogger` config.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({
  DOMEvents:{
    onFocus:(params, context)=>{...}
  }
})

function App() {
  return (
    <Log.Provider initialContext={{}}>
      <Log.DOMEvent type="onFocus" params={{}}>
        <input />
      </Log.DOMEvent>
    </Log.Provider>
  );
}
```

### props

- `type: DOMEventNames`
  - The name of the event. (e.g. onClick, onFocus..,)
- `params: unknown`
  - The parameters used to log the event.

## Click

`Click` is the same as `DomEvent` with `type="onClick`.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({
  DOMEvents:{
    onClick:(params, context)=>{...}
  }
})

function App() {
  return (
    <Log.Provider initialContext={{}}>
      <Log.Click params={{}}>
        <button>Click Me</button>
      </Log.Click>
    </Log.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to log the event.

## Impression

`Impression` is used for tracking impression events. It wraps a single child component and fires the `onImpression` function specified in `createLogger` config.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({
  impression:{
    onImpression:(params, context)=>{...}
    options:{...}
  }
})

function App() {
  return (
    <Log.Provider initialContext={{}}>
      <Log.Impression params={{}} options={{}}>
        <input />
      </Log.Impression>
    </Log.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to log the event.
- `options: ImpressionOptions`
  - **optional**
  - If set, it will over override the options specified in `createLogger` config.

## PageView

`PageView` is used for tracking page view events. It fires the `onPageView` function specified in `createLogger` config when mounted.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({
  pageView:{
    onPageView:(params, context)=>{...}
  }
})

function App() {
  return (
    <Log.Provider initialContext={{}}>
      <Log.PageView params={{}}/>
    </Log.Provider>
  );
}
```

### props

- `params: unknown`
  - The parameters used to log the event.

## SetContext

`SetContext` is used to set or change the context. It will set the context when mounted.

```tsx
import { createLogger } from '@loggists/logger'

const [Log] = createLogger({...})

function App() {
  return (
    <Log.Provider initialContext={{}}>
      <Log.SetContext context={{}}/>
    </Log.Provider>
  );
}
```

### props

- `context: unknown | ((prevContext: unknown) => unknown)`
  - The context to set.
