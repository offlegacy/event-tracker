import Link from "next/link";
import { Image } from "nextra/components";

import { Logo } from "@/logo";
import { TrackClick, TrackPageView } from "@/tracker";
import { importPage } from "nextra/pages";
import { Lang } from "@/lib/types/lang";

export const metadata = {};

const TEXT_MAP = {
  description: {
    ko: "React 애플리케이션을 위한 경량화되고 타입 안전한 이벤트 추적 라이브러리로, 깔끔한 코드와 최적의 성능을 유지하면서 애널리틱스 통합을 단순화합니다.",
    en: "A lightweight, type-safe event tracking library for React applications that simplifies analytics integration while maintaining clean code and optimal performance.",
  },
  get_started: {
    ko: "시작하기",
    en: "Get Started",
  },
  featureCards: [
    {
      ko: {
        title: "타입 안전성이 보장된 API",
        description: "타입 안전성을 갖춘 선언적 이벤트 추적 API를 제공해요.",
      },
      en: {
        title: "Type-safe APIs",
        description: "Declarative event tracking with complete type safety",
      },
    },
    {
      ko: {
        title: "최적화된 성능",
        description: "이벤트 배칭을 통한 향상된 성능을 제공해요.",
      },
      en: {
        title: "Optimized Performance",
        description: "Enhanced performance through event batching",
      },
    },
    {
      ko: {
        title: "순서 보장",
        description: "비동기 작업의 실행 순서가 보장돼요.",
      },
      en: {
        title: "Guaranteed Order",
        description: "Guaranteed execution order for async operations",
      },
    },
    {
      ko: {
        title: "애널리틱스 도구에 구애받지 않음",
        description: "모든 애널리틱스 도구와 호환 가능해요.",
      },
      en: {
        title: "Analytics Integration",
        description: "Works with any analytics provider of your choice",
      },
    },
    {
      ko: {
        title: "깔끔한 분리",
        description: "비즈니스 로직과 이벤트 추적 로직의 명확한 분리를 제공해요.",
      },
      en: {
        title: "Clean Separation",
        description: "Keeps tracking logic separate from business logic",
      },
    },
    {
      ko: {
        title: "작은 번들 사이즈",
        description: "애플리케이션 번들 크기에 최소한의 영향을 미쳐요.",
      },
      en: {
        title: "Lightweight",
        description: "Minimal bundle size impact on your application",
      },
    },
  ],
} as const;

export default async function Page(props: { params: Promise<{ mdxPath: string[]; lang: Lang }> }) {
  const { mdxPath, lang } = await props.params;
  await importPage(mdxPath, lang);

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 py-16">
        <div className="mb-16 flex flex-col items-center text-center">
          <Logo size={200} />
          <h1 className="mb-6 text-5xl font-bold">event-tracker</h1>
          <p className="mb-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">{TEXT_MAP.description[lang]}</p>
          <div className="mb-8 flex gap-4">
            <a href="https://github.com/offlegacy/event-tracker/blob/main/LICENSE" target="_blank" rel="noopener">
              <Image src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
            </a>
            <a href="https://www.npmjs.com/package/@offlegacy/event-tracker" target="_blank" rel="noopener">
              <Image src="https://img.shields.io/npm/v/@offlegacy/event-tracker?logo=npm" alt="NPM Version" />
            </a>
          </div>
          <TrackClick params={{ target: "Get Started button" }}>
            <Link
              href="/docs"
              className="rounded-lg bg-blue-500 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-600"
            >
              {TEXT_MAP.get_started[lang]}
            </Link>
          </TrackClick>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🎯"
            title={TEXT_MAP.featureCards[0][lang].title}
            description={TEXT_MAP.featureCards[0][lang].description}
          />
          <FeatureCard
            icon="⚡️"
            title={TEXT_MAP.featureCards[1][lang].title}
            description={TEXT_MAP.featureCards[1][lang].description}
          />
          <FeatureCard
            icon="🔄"
            title={TEXT_MAP.featureCards[2][lang].title}
            description={TEXT_MAP.featureCards[2][lang].description}
          />
          <FeatureCard
            icon="🔌"
            title={TEXT_MAP.featureCards[3][lang].title}
            description={TEXT_MAP.featureCards[3][lang].description}
          />
          <FeatureCard
            icon="🧩"
            title={TEXT_MAP.featureCards[4][lang].title}
            description={TEXT_MAP.featureCards[4][lang].description}
          />
          <FeatureCard
            icon="📦"
            title={TEXT_MAP.featureCards[5][lang].title}
            description={TEXT_MAP.featureCards[5][lang].description}
          />
        </div>
      </div>
      <TrackPageView params={{ title: "Home" }} />
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
