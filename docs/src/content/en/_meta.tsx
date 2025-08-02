import type { MetaRecord } from "nextra";

export default {
  index: {
    type: "page",
    display: "hidden",
    theme: {
      layout: "full",
      toc: false,
    },
  },
  docs: {
    type: "page",
    title: "Docs",
  },
} satisfies MetaRecord;
