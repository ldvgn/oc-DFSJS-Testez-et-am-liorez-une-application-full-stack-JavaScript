import fs from "node:fs";
import path from "node:path";
import { test as base } from "@playwright/test";
import v8toIstanbul from "v8-to-istanbul";

const COVERAGE_DIR = path.join(process.cwd(), ".coverage-e2e-tmp");

function urlToFilePath(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    if (!pathname.startsWith("/src/")) return null;
    return path.join(process.cwd(), pathname);
  } catch {
    return null;
  }
}

export const test = base.extend<{ autoCoverage: void }>({
  autoCoverage: [
    async ({ page, browserName }, use, testInfo) => {
      const enabled = browserName === "chromium" && !!process.env.COVERAGE;

      if (enabled) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }

      await use();

      if (!enabled) return;

      const coverage = await page.coverage.stopJSCoverage();

      fs.mkdirSync(COVERAGE_DIR, { recursive: true });

      for (const entry of coverage) {
        const filePath = urlToFilePath(entry.url);
        if (!filePath || !entry.source) continue;

        const converter = v8toIstanbul(filePath, 0, { source: entry.source });
        await converter.load();
        converter.applyCoverage(entry.functions);

        const istanbulCoverage = converter.toIstanbul();
        const outName = `${testInfo.testId}-${Buffer.from(entry.url).toString("base64url")}.json`;
        fs.writeFileSync(
          path.join(COVERAGE_DIR, outName),
          JSON.stringify(istanbulCoverage),
        );
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
