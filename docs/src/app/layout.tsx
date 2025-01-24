import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style-prefixed.css";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s | event-tracker",
  },
};

const navbar = <Navbar logo={<b>event-tracker</b>} />;
const footer = <Footer>MIT {new Date().getFullYear()} © loggists</Footer>;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/loggists/event-tracker/tree/main/docs"
          footer={footer}
          darkMode
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
