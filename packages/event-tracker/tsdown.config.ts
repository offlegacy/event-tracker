import { defineConfig } from "tsdown";

export default defineConfig({
  banner: { js: '"use client"' },
  format: ["cjs", "esm"],
  target: ["es2022"],
  entry: ["src/index.ts"],
  outDir: "dist",
  sourcemap: true,
  dts: true,
  clean: true,
  external: ["react"],
});
