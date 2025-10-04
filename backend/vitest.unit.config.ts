import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/__tests__/**/*.unit.test.ts",
      "src/features/**/*.unit.test.ts"
    ],
  },
});
