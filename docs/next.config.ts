import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: false,
  },
  readingTime: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
