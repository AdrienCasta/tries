import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vite.config.js";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "src/__tests__/**/*.e2e.test.ts",
        "src/features/**/*.e2e.test.ts",
      ],
      testTimeout: 30000,
    },
  })
);
