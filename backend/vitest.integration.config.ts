import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vite.config.js";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "src/__tests__/**/*.integration.test.ts",
        "src/features/**/*.integration.test.ts"
      ],
      testTimeout: 10000,
    },
  })
);
