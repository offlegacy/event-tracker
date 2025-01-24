import type { NextConfig } from "next";
import nextra from "nextra";

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/docs",
});

const nextConfig: NextConfig = {};

export default withNextra(nextConfig);
