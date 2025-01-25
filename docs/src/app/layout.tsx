import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style-prefixed.css";
import "./globals.css";
import { TrackClick, TrackImpression, TrackProvider } from "@/tracker";

export const metadata = {
  title: {
    template: "%s | event-tracker",
  },
};

const navbar = (
  <Navbar
    logo={
      <TrackClick params={{ target: "logo" }}>
        <b>event-tracker</b>
      </TrackClick>
    }
  />
);
const footer = (
  <TrackImpression params={{ target: "footer" }}>
    <Footer>MIT {new Date().getFullYear()} © OffLegacy</Footer>
  </TrackImpression>
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </Head>
      <body>
        <TrackProvider initialContext={{ referrer: typeof window !== "undefined" ? document.referrer : "" }}>
          <Layout
            navbar={navbar}
            pageMap={await getPageMap()}
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
