import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load .env.test for integration tests
dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.integration.test.ts"],
    testTimeout: 30000,
  },
});
