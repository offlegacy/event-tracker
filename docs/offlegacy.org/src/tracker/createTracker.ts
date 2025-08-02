import { createTracker } from "@offlegacy/event-tracker";

import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
const isProduction = process.env.NODE_ENV === "production";

interface Context {
  referrer?: string;
}

interface EventParams {
  title?: string;
  target?: string;
}

const track = isProduction ? amplitude.track : console.log;

export const [Track] = createTracker({
  init: () => {
    if (isProduction) {
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
