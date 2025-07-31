import Link from "next/link";

import { Logo } from "@/logo";
import { TrackClick, TrackPageView } from "@/tracker";
import { DemoCode } from "@/components/demo-playground";
import Image from "next/image";
import { InstallCopyButton } from "@/components/install-copy-button";

type FeatureCardText = {
  title: string;
  description: string;
};

type Props = {
  description: string;
  startedText: string;
  featureSectionTitle: string;
  featureSectionContents: FeatureCardText[];
};

export default async function HomePage({
  description,
  startedText,
  featureSectionTitle,
  featureSectionContents,
}: Props) {
  return (
    <main className="mx-auto flex max-w-screen-xl flex-col gap-48 break-keep px-6 py-32">
      <TrackPageView params={{ title: "Home" }} />
      <div className="flex flex-col justify-between gap-10 xl:flex-row">
        <div className="flex flex-col gap-6">
          <Logo size={200} />
          <div className="space-y-2">
            <h1 className="text-6xl font-bold">Event Tracker</h1>
            <p className="max-w-2xl text-xl text-gray-600 dark:text-gray-300">{description}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <TrackClick params={{ target: "Get Started button" }}>
              <Link
                href="/docs/introduction"
                className="flex items-center justify-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                {startedText}
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
        <p className="text-center text-3xl font-bold">{featureSectionTitle}</p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureSectionContents.map((card) => (
            <FeatureCard key={card.title} title={card.title} description={card.description} />
          ))}
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
