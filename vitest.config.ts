import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      exclude: [
        "app/generated/**",
        "app/**/page.tsx",
        "app/**/layout.tsx",
        "app/api/**",
        "node_modules/**",
        ".next/**",
      ],
    },
  },
});
