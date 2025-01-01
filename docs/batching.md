# Batching

If you are using analytics tools like `@amplitude/analytics-browser` or `react-ga4`, you don't need to think much about performance because they have their own mechanisms to guarantee request orders and performance.

If not, you might need to think about the performance issues since each event logging will probably cost an HTTP request.

To solve this issue, you can use the `batch` option. It will batch the parameters returned by the event functions in memory and provide the batch at the right time so you can handle them at once.

```tsx
const [Log, useLog] = createLogger({
  // ...
  DOMEvents:{
    onClick:(clickParams: ClickParams, context: Context)=>{
      return {...clickParams, ...context, event_type:'click', timestamp: new Date().getTime()}
    }
  },
  batch: {
    enable: true,
    interval: 2000,
    thresholdSize: 100,
    onFlush: (batch, isBrowserClosing)=>{
      if(isBrowserClosing){
        navigator.sendBeacon('/analytics/collect/batch',{...});
        return;
      }

      fetch('/analytics/collect/batch',{...})
    }
  },
});

function App() {
  return (
    <Log.Provider initialContext={{ deviceId: 'deviceId' }}>
      <Log.Click params={{ target: 'button', text: 'Click Me' }}>
        <button>Click Me</button>
      </Log.Click>
    </Log.Provider>
  );
}

```

For example, let's see what happens with the code above:

- The user clicks the `Click Me` button 5 times
- The `DOMEvents.onClick` function runs each time with the parameters and context passed. It returns an object with the parameters ready to be sent. The object is stored in the batch queue.
- 2 seconds later, the onFlush function is run with the batch which is an array with 5 items. Each of which is an object returned from the `DOMEvents.onClick` function.

#### To use batching, it is essential to return a certain value in each event functions. The event function is not batched. It is the **_return value_** of the event function that is batched.

The flushing occurs in three situations:

1. `batch` is enabled, interval is reached.
2. `batch` is enabled, the batch queue is full.
3. `batch` is enabled, the user closes or hides the browser.

Note that to handle the third situation, you probably need to use [`navigator.sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) like the example above, to make sure the network request is safely sent when browsers are closed. `isBrowserClosing`is true when onFlush is executed in the third situation.
