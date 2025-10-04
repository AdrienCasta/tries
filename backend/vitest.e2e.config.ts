import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load .env.test for e2e tests
dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    include: [
      "src/__tests__/**/*.e2e.test.ts",
      "src/features/**/*.e2e.test.ts"
    ],
    testTimeout: 30000,
  },
});
