import { Image } from "nextra/components";
import Link from "next/link";
import { TrackClick, TrackPageView } from "@/tracker";
import { Logo } from "@/logo";

export const metadata = {};

export default function Page() {
  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 py-16">
        <div className="mb-16 flex flex-col items-center text-center">
          <Logo size={200} />
          <h1 className="mb-6 text-5xl font-bold">event-tracker</h1>
          <p className="mb-6 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            A lightweight, type-safe event tracking library for React applications that simplifies analytics integration
            while maintaining clean code and optimal performance.
          </p>
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
              Get Started
            </Link>
          </TrackClick>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🎯"
            title="Type-safe APIs"
            description="Declarative event tracking with complete type safety"
          />
          <FeatureCard
            icon="⚡️"
            title="Optimized Performance"
            description="Enhanced performance through event batching"
          />
          <FeatureCard
            icon="🔄"
            title="Guaranteed Order"
            description="Guaranteed execution order for async operations"
          />
          <FeatureCard
            icon="🔌"
            title="Analytics Agnostic"
            description="Works with any analytics provider of your choice"
          />
          <FeatureCard
            icon="🧩"
            title="Clean Separation"
            description="Keeps tracking logic separate from business logic"
          />
          <FeatureCard icon="📦" title="Lightweight" description="Minimal bundle size impact on your application" />
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
