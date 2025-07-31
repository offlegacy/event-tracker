import type { MetaRecord } from "nextra";

export default {
  "getting-started-separator": {
    type: "separator",
    title: "Getting Started",
  },
  introduction: {
    title: "Introduction",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "why-event-tracker": {
    title: "Why Event Tracker?",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  installation: {
    title: "Installation",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  // TODO: Quick Start
  "api-reference-separator": {
    title: "API Reference",
    type: "separator",
  },
  "create-tracker": {
    title: "createTracker",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  components: { title: "Components" },
  "use-tracker": {
    title: "useTracker",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "advanced-separator": {
    title: "Guide",
    type: "separator",
  },
  batching: {
    title: "Batching",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "data-type-validation": {
    title: "Data Validation",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "example-separator": {
    title: "Examples",
    type: "separator",
  },
  "basic-example": {
    title: "Basic",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "with-google-analytics-example": {
    title: "w/ Google Analytics",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "with-zod-example": {
    title: "w/ Zod",
    theme: {
      toc: true,
      layout: "default",
    },
  },
} satisfies MetaRecord;
