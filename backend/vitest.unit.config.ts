import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vite.config.js";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "src/__tests__/**/*.unit.test.ts",
        "src/features/**/*.unit.test.ts"
      ],
    },
  })
);
