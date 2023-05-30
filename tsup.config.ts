import { defineConfig } from "tsup";

const isDev = process.env.npm_lifecycle_event === "dev";

export default defineConfig({
  entry: ["cli/index.ts"],
  format: ["esm"],
  minify: !isDev,
  sourcemap: true,
  target: "esnext",
  outDir: "dist",
  onSuccess: isDev ? "node dist/index.js --help" : undefined,
});
