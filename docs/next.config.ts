import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/docs",
});

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "ko"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "contrib.rocks",
      },
    ],
  },
};

export default withNextra(nextConfig);
