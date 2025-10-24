import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@__tests__": path.resolve(__dirname, "./src/__tests__"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
});
