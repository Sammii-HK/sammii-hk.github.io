import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    include: ["app/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
