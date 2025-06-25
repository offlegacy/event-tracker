import Link from "next/link";

import { Logo } from "@/logo";
import { TrackClick, TrackPageView } from "@/tracker";
import { importPage } from "nextra/pages";
import type { Lang } from "@/lib/types/lang";
import { DemoCode } from "@/components/demo-playground";
import Image from "next/image";

export const metadata = {};

const TEXT_MAP = {
  description: {
    ko: "React 애플리케이션을 위한 완전한 이벤트 트래킹 시스템.",
    en: "Comprehensive solution for event tracking in React applications.",
  },
  get_started: {
    ko: "시작하기",
    en: "Get Started",
  },
  featureCardsTitle: {
    ko: "Event Tracker가 제시하는 새로운 패러다임",
    en: "New Paradigm Offered by Event Tracker",
  },
  featureCards: [
    {
      ko: {
        title: "타입 안정성을 갖춘 선언적 API",
        description:
          "TypeScript를 완벽하게 지원하여 개발 과정에서의 오류를 줄이고, 자동 완성을 통해 생산성을 높입니다.",
      },
      en: {
        title: "Declarative API with Type Safety",
        description:
          "Fully supports TypeScript, reducing errors during development and increasing productivity through auto-completion.",
      },
    },
    {
      ko: {
        title: "강력한 데이터 타입 검증",
        description: "Zod를 활용한 스키마 기반 검증으로 데이터의 신뢰성을 확보합니다.",
      },
      en: {
        title: "Powerful Data Type Validation",
        description: "Ensures data reliability through schema-based validation using Zod.",
      },
    },
    {
      ko: {
        title: "최적화된 성능",
        description:
          "배칭이나 디바운스, 스로틀링 기능을 통해 네트워크 요청을 최소화하고 애플리케이션 성능에 미치는 영향을 줄입니다.",
      },
      en: {
        title: "Optimized Performance	",
        description:
          "Minimizes network requests through batching, debouncing, or throttling, reducing the impact on application performance.",
      },
    },
    {
      ko: {
        title: "실행 순서 보장",
        description: "비동기적으로 발생하는 이벤트들에 대해서도 의도한 순서대로 처리되도록 보장합니다.",
      },
      en: {
        title: "Guaranteed Execution Order",
        description: "Ensures asynchronous events are processed in the intended sequence.",
      },
    },
    {
      ko: {
        title: "애널리틱스 도구 독립성	",
        description:
          "특정 애널리틱스 서비스에 종속되지 않고, 원하는 모든 도구(Google Analytics, Amplitude 등)와 유연하게 통합할 수 있습니다.",
      },
      en: {
        title: "Analytics Tool Independence",
        description:
          "Flexible integration with any analytics tool (e.g., Google Analytics, Amplitude), without being tied to any specific provider.",
      },
    },
    {
      ko: {
        title: "명확한 관심사 분리",
        description: "트래킹 로직과 비즈니스 로직을 효과적으로 분리하여 코드의 유지보수성과 확장성을 극대화합니다.",
      },
      en: {
        title: "Clear Separation of Concerns",
        description:
          "Effectively separates tracking logic from business logic, maximizing code maintainability and scalability.",
      },
    },
  ],
} as const;

export default async function Page(props: { params: Promise<{ mdxPath: string[]; lang: Lang }> }) {
  const { mdxPath, lang } = await props.params;
  await importPage(mdxPath, lang);

  return (
    <main className="mx-auto flex max-w-screen-xl flex-col gap-48 px-6 py-32">
      <TrackPageView params={{ title: "Home" }} />
      <div className="flex flex-col justify-between gap-10 lg:flex-row">
        <div className="flex flex-col gap-6">
          <Logo size={200} />
          <div className="space-y-2">
            <h1 className="text-6xl font-bold">Event Tracker</h1>
            <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-300">{TEXT_MAP.description[lang]}</p>
          </div>
          <div className="flex gap-4">
            <TrackClick params={{ target: "Get Started button" }}>
              <Link
                href="/docs"
                className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
              >
                {TEXT_MAP.get_started[lang]}
              </Link>
            </TrackClick>
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300"
            >
              npm i @offlegacy/event-tracker
            </button>
          </div>
        </div>
        <DemoCode />
      </div>
      <div className="flex flex-col items-center justify-center gap-10">
        <p className="text-center text-3xl font-bold">{TEXT_MAP.featureCardsTitle[lang]}</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🔧"
            title={TEXT_MAP.featureCards[0][lang].title}
            description={TEXT_MAP.featureCards[0][lang].description}
          />
          <FeatureCard
            icon="✅"
            title={TEXT_MAP.featureCards[1][lang].title}
            description={TEXT_MAP.featureCards[1][lang].description}
          />
          <FeatureCard
            icon="⚡️"
            title={TEXT_MAP.featureCards[2][lang].title}
            description={TEXT_MAP.featureCards[2][lang].description}
          />
          <FeatureCard
            icon="🎯"
            title={TEXT_MAP.featureCards[3][lang].title}
            description={TEXT_MAP.featureCards[3][lang].description}
          />
          <FeatureCard
            icon="🎛️"
            title={TEXT_MAP.featureCards[4][lang].title}
            description={TEXT_MAP.featureCards[4][lang].description}
          />
          <FeatureCard
            icon="🏗️"
            title={TEXT_MAP.featureCards[5][lang].title}
            description={TEXT_MAP.featureCards[5][lang].description}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-10">
        <h2 className="text-center text-4xl font-bold">Driven by the Community</h2>
        <a
          href="https://github.com/offlegacy/event-tracker/contributors"
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-24 w-80 sm:h-32 sm:w-96"
        >
          <Image
            src="https://contrib.rocks/image?repo=offlegacy/event-tracker"
            alt="Contributors"
            fill
            className="object-contain"
            unoptimized
          />
        </a>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="break-keep rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
