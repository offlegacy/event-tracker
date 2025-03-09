import { headers } from "next/headers";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, LocaleSwitch, Navbar } from "nextra-theme-docs";

import "nextra-theme-docs/style-prefixed.css";
import "../globals.css";
import { TrackClick, TrackImpression, TrackProvider } from "@/tracker";
import { Logo } from "@/logo";
import { Lang } from "@/lib/types/lang";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Event Tracker",
    default: "Event Tracker",
  },
  description: "Comprehensive solution for event tracking in React applications.",
  openGraph: {
    title: {
      template: "%s | Event Tracker",
      default: "Event Tracker",
    },
    images: ["img/og-webp.webp"],
    description: "Comprehensive solution for event tracking in React applications.",
  },
  icons: {
    icon: "img/logo.jpg",
  },
};

const navbar = (
  <Navbar
    logo={
      <TrackClick params={{ target: "logo" }}>
        <div className="flex items-center gap-2">
          <Logo />
          <b>Event Tracker</b>
        </div>
      </TrackClick>
    }
    projectLink="https://github.com/offlegacy/event-tracker"
  >
    <LocaleSwitch />
  </Navbar>
);
const footer = (
  <TrackImpression params={{ target: "footer" }}>
    <Footer>MIT {new Date().getFullYear()} © OffLegacy</Footer>
  </TrackImpression>
);

export default async function RootLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const pageMap = await getPageMap(lang);
  const headersList = await headers();

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="img/logo.jpg" type="image/jpg" />
      </Head>
      <body>
        <TrackProvider
          initialContext={{
            referrer: headersList.get("referer") ?? headersList.get("referrer") ?? undefined,
          }}
        >
          <Layout
            i18n={[
              { locale: "en", name: "English" },
              { locale: "ko", name: "한국어" },
            ]}
            navbar={navbar}
            pageMap={pageMap}
            docsRepositoryBase="https://github.com/offlegacy/event-tracker/tree/main/docs"
            footer={footer}
            darkMode
          >
            {children}
          </Layout>
        </TrackProvider>
      </body>
    </html>
  );
}
