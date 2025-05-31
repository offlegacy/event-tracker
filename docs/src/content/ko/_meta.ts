import type { MetaRecord } from "nextra";

export default {
  "getting-started-separator": {
    type: "separator",
    title: "시작하기",
  },
  index: {
    title: "소개",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "why-event-tracker": {
    title: "왜 Event Tracker인가요?",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  installation: {
    title: "설치하기",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "api-reference-separator": {
    title: "API 레퍼런스",
    type: "separator",
  },
  "create-tracker": {
    title: "createTracker",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  components: {
    title: "Components",
    theme: {
      toc: true,
      layout: "default",
      collapsed: true,
    },
  },
  useTracker: {
    title: "useTracker",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "advanced-separator": {
    title: "가이드",
    type: "separator",
  },
  batching: {
    title: "배칭",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "data-type-validation": {
    title: "데이터 타입 검증",
    theme: {
      toc: true,
      layout: "default",
    },
  },
  "example-separator": {
    title: "예제",
    type: "separator",
  },
  "basic-example": {
    title: "기본",
    theme: {
      toc: true,
      layout: "default",
    },
  },
} satisfies MetaRecord;
