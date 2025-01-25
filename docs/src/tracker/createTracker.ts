import { createTracker } from "@loggists/event-tracker";
import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

interface Context {
  referrer?: string;
}

interface PageViewParams {
  title: string;
}

export const [Track] = createTracker({
  init: () => {
    if (API_KEY === undefined) {
      throw new Error("NO API KEY");
    }
    amplitude.init(API_KEY, {
      autocapture: false,
    });
  },
  pageView: {
    onPageView: (params: PageViewParams, context: Context) => {
      amplitude.track("pageView", { ...params, referrer: context.referrer });
    },
  },
});
