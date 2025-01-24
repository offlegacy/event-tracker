import { Image } from "nextra/components";
import Link from "next/link";

export const metadata = {};

export default function Page() {
  return (
    <div className="flex flex-col items-center px-6 mx-auto max-w-6xl py-16 min-h-screen">
      <div className="flex flex-col items-center text-center mb-16">
        <Image
          src="/logo.jpg"
          alt="event-tracker logo"
          width={200}
          height={200}
          className="mb-8"
        />
        <h1 className="text-5xl font-bold mb-6">event-tracker</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
          A lightweight, type-safe event tracking library for React applications
          that simplifies analytics integration while maintaining clean code and
          optimal performance.
        </p>
        <div className="flex gap-4 mb-8">
          <a
            href="https://github.com/loggists/event-tracker/blob/main/LICENSE"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="https://img.shields.io/badge/license-MIT-blue.svg"
              alt="MIT License"
            />
          </a>
          <a
            href="https://www.npmjs.com/package/@loggists/event-tracker"
            target="_blank"
            rel="noopener"
          >
            <Image
              src="https://img.shields.io/npm/v/@loggists/event-tracker?logo=npm"
              alt="NPM Version"
            />
          </a>
        </div>
        <Link
          href="/docs"
          className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Get Started
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
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
        <FeatureCard
          icon="📦"
          title="Lightweight"
          description="Minimal bundle size impact on your application"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
