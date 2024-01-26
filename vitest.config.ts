import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    css: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: [
        "**/amplify/**",
        "**/.*",
        "src/API.ts",
        "src/aws-exports.js",
        "src/vite-env.d.ts",
        "src/graphql/**",
      ],
    },
  },
});
