import { createTracker } from "@offlegacy/event-tracker";

import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
const isDev = process.env.NODE_ENV === "development";

interface Context {
  referrer?: string;
}

interface EventParams {
  title?: string;
  target?: string;
}

const track = isDev ? console.log : amplitude.track;

export const [Track] = createTracker({
  init: () => {
    if (!isDev) {
      if (API_KEY === undefined) {
        throw new Error("NO API KEY");
      }
      amplitude.init(API_KEY, {
        autocapture: false,
      });
    }
  },
  pageView: {
    onPageView: (params: EventParams, context: Context) => {
      track("pageView", { ...params, referrer: context.referrer });
    },
  },
  DOMEvents: {
    onClick: (params: EventParams, context: Context) => {
      track("click", {
        ...params,
        referrer: context.referrer,
      });
    },
  },
  impression: {
    onImpression: (params: EventParams, context: Context) => {
      track("impression", {
        ...params,
        referrer: context.referrer,
      });
    },
  },
});
