import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        // 按你的本地开发服端口改，比如 5173 / 3000 / 8080
        baseUrl: "http://localhost:8080",
        specPattern: "tests/e2e/**/*.cy.{ts,tsx}",
        supportFile: "tests/e2e/support/e2e.ts",
        viewportWidth: 1280,
        viewportHeight: 800,
        retries: { runMode: 1, openMode: 0 }
    },
    video: true
});
