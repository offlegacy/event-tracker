import * as esbuild from "esbuild";

// ESM 빌드
await esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist/esm",
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  format: "esm",
  target: ["es2022"],
  external: ["react", "react-dom"],
});

// CJS 빌드
await esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist/cjs",
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: "node",
  format: "cjs",
  target: ["es2022"],
  external: ["react", "react-dom"],
});
