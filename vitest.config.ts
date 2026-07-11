import { defineConfig } from "vitest/config";

export const coverageThresholds = {
  lines: 80,
  branches: 83,
  functions: 87,
  statements: 80,
} as const;

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      all: true,
      include: ["index.ts", "src/**/*.ts"],
      reporter: ["text", "json-summary"],
      thresholds: coverageThresholds,
    },
  },
});
