import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, LocaleSwitch, Navbar } from "nextra-theme-docs";

import "nextra-theme-docs/style-prefixed.css";
import "../globals.css";
import { TrackClick, TrackImpression, TrackProvider } from "@/tracker";
import { Logo } from "@/logo";
import { Lang } from "@/lib/types/lang";

export const metadata = {
  title: {
    template: "%s | event-tracker",
  },
};

const navbar = (
  <Navbar
    logo={
      <TrackClick params={{ target: "logo" }}>
        <div className="flex items-center gap-2">
          <Logo />
          <b>event-tracker</b>
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

  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </Head>
      <body>
        <TrackProvider initialContext={{ referrer: typeof window !== "undefined" ? document.referrer : "" }}>
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
