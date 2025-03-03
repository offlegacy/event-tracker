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
};

export default withNextra(nextConfig);
