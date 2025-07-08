import Link from "next/link";

import { Logo } from "@/logo";
import { TrackClick, TrackPageView } from "@/tracker";
import { importPage } from "nextra/pages";
import type { Lang } from "@/lib/types/lang";
import { DemoCode } from "@/components/demo-playground";
import Image from "next/image";
import { InstallCopyButton } from "@/components/install-copy-button";

export const metadata = {};

const TEXT_MAP = {
  description: {
    ko: "React 애플리케이션을 위한 완전한 이벤트 트래킹 시스템",
    en: "Comprehensive solution for event tracking in React applications",
  },
  get_started: {
    ko: "시작하기",
    en: "Get Started",
  },
  featureCardsTitle: {
    ko: "Event Tracker가 제시하는 새로운 이벤트 트래킹 패러다임",
    en: "New Paradigm of Event Tracking Offered by Event Tracker",
  },
  featureCards: [
    {
      ko: {
        title: "선언적 API",
        description: "트래킹을 위한 별도의 설정이나 복잡한 코드 없이, 컴포넌트 형태로 직관적으로 선언할 수 있습니다.",
      },
      en: {
        title: "Declarative API",
        description: "Track events intuitively through component-based declarations, without boilerplate.",
      },
    },
    {
      ko: {
        title: "강력한 데이터 타입 검증",
        description:
          "Zod 기반의 정적 스키마 검증으로 런타임 이전에 오류를 방지하고, 수집되는 이벤트 데이터의 신뢰도를 보장합니다.",
      },
      en: {
        title: "Powerful Data Type Validation",
        description:
          "Schema-based validation with Zod catches issues before runtime and guarantees the integrity of your event data.",
      },
    },
    {
      ko: {
        title: "최적화된 성능",
        description:
          "배칭, 디바운스, 스로틀링 등 네트워크 요청을 최소화하는 다양한 전략이 내장되어 있어, 성능 저하 없이 안정적으로 트래킹할 수 있습니다.",
      },
      en: {
        title: "Optimized Performance",
        description:
          "Built-in strategies like batching, debouncing, and throttling minimize network overhead, enabling efficient and reliable tracking.",
      },
    },
    {
      ko: {
        title: "실행 순서 보장",
        description:
          "비동기 상황에서도 이벤트가 의도한 순서대로 처리되도록 설계되어, 복잡한 사용자 흐름에서도 정확한 트래킹이 가능합니다.",
      },
      en: {
        title: "Guaranteed Execution Order",
        description:
          "Ensures that events are processed in the intended order, even under asynchronous conditions—crucial for accurate tracking in complex flows.",
      },
    },
    {
      ko: {
        title: "애널리틱스 도구 독립성",
        description:
          "Google Analytics, Amplitude, Segment 등 어떤 도구든 자유롭게 연동할 수 있어, 기존 인프라를 변경하지 않고도 도입이 가능합니다.",
      },
      en: {
        title: "Analytics Tool Independence",
        description:
          "Easily integrates with tools like Google Analytics, Amplitude, or Segment—without forcing you to switch or couple to a specific vendor.",
      },
    },
    {
      ko: {
        title: "명확한 관심사 분리",
        description:
          "트래킹 로직을 비즈니스 코드에서 완전히 분리함으로써 코드의 가독성, 테스트 용이성, 유지보수성을 모두 향상시킵니다.",
      },
      en: {
        title: "Clear Separation of Concerns",
        description:
          "Keeps tracking logic out of your business logic, resulting in cleaner code that’s easier to test, maintain, and evolve.",
      },
    },
  ],
} as const;

export default async function Page(props: { params: Promise<{ mdxPath: string[]; lang: Lang }> }) {
  const { mdxPath, lang } = await props.params;
  await importPage(mdxPath, lang);

  return (
    <main className="mx-auto flex max-w-screen-xl flex-col gap-48 break-keep px-6 py-32">
      <TrackPageView params={{ title: "Home" }} />
      <div className="flex flex-col justify-between gap-10 xl:flex-row">
        <div className="flex flex-col gap-6">
          <Logo size={200} />
          <div className="space-y-2">
            <h1 className="text-6xl font-bold">Event Tracker</h1>
            <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-300">{TEXT_MAP.description[lang]}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <TrackClick params={{ target: "Get Started button" }}>
              <Link
                href="/docs"
                className="flex items-center justify-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                {TEXT_MAP.get_started[lang]}
              </Link>
            </TrackClick>
            <InstallCopyButton />
          </div>
        </div>
        <div className="min-h-[572.75px]">
          <DemoCode />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-16">
        <p className="text-center text-3xl font-bold">{TEXT_MAP.featureCardsTitle[lang]}</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title={TEXT_MAP.featureCards[0][lang].title}
            description={TEXT_MAP.featureCards[0][lang].description}
          />
          <FeatureCard
            title={TEXT_MAP.featureCards[2][lang].title}
            description={TEXT_MAP.featureCards[2][lang].description}
          />
          <FeatureCard
            title={TEXT_MAP.featureCards[4][lang].title}
            description={TEXT_MAP.featureCards[4][lang].description}
          />
          <FeatureCard
            title={TEXT_MAP.featureCards[3][lang].title}
            description={TEXT_MAP.featureCards[3][lang].description}
          />
          <FeatureCard
            title={TEXT_MAP.featureCards[5][lang].title}
            description={TEXT_MAP.featureCards[5][lang].description}
          />
          <FeatureCard
            title={TEXT_MAP.featureCards[1][lang].title}
            description={TEXT_MAP.featureCards[1][lang].description}
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

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="break-keep rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
