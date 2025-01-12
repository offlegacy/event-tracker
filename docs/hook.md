## useTracker

`useTracker` is a hook that provides the functions given in `createTracker` config. It also provides the function to get and set the context.

```tsx
import { createTracker } from "@loggists/event-tracker";

const [_, useTracker] = createTracker({...})

const { setContext, getContext, events, send } = useTracker();
```

### Return Value

- `setContext: (params: unknown) => void`
- `getContext: () => unknown`
- `events: Record<keyof EventNames, (params: unknown) => void>`
- `send: (params: unknown) => void`
