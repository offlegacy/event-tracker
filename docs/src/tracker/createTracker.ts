import { createTracker } from "@offlegacy/event-tracker";

import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
const isDev = process.env.NODE_ENV === "development";

interface Context {
  referrer?: string;
}

interface PageViewParams {
  title: string;
}

interface ClickParams {
  target: string;
}

interface ImpressionParams {
  target: string;
}

const track = isDev ? console.log : amplitude.track;

export const [Track] = createTracker({
  init: () => {
    if (API_KEY === undefined) {
      throw new Error("NO API KEY");
    }
    if (!isDev)
      amplitude.init(API_KEY, {
        autocapture: false,
      });
  },
  pageView: {
    onPageView: (params: PageViewParams, context: Context) => {
      track("pageView", { ...params, referrer: context.referrer });
    },
  },
  DOMEvents: {
    onClick: (params: ClickParams, context: Context) => {
      track("click", {
        ...params,
        referrer: context.referrer,
      });
    },
  },
  impression: {
    onImpression: (params: ImpressionParams, context: Context) => {
      track("impression", {
        ...params,
        referrer: context.referrer,
      });
    },
  },
});
