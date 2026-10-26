import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    // Los tests no usan la base de datos (los repositories se simulan) ni el .env real
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
      CLINIC_TIMEZONE: "America/Caracas",
      CLIENT_ORIGIN: "http://localhost:5173",
    },
    mockReset: true,
  },
});
