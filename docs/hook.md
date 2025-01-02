## useLog

`useLog` is a hook that provides the functions given in `createLogger` config. It also provides the function to get and set the context.

```tsx
import { createLogger } from "@loggists/logger";

const [_, useLog] = createLogger({...})

const { setContext, getContext, events, send } = useLog();
```

### Return Value

- `setContext: (params: unknown) => void`
- `getContext: () => unknown`
- `events: Record<keyof EventNames, (params: unknown) => void>`
- `send: (params: unknown) => void`
