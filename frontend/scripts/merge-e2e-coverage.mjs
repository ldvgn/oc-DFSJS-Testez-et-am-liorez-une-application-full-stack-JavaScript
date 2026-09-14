import fs from "node:fs";
import path from "node:path";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const TMP_DIR = path.join(process.cwd(), ".coverage-e2e-tmp");
const OUT_DIR = path.join(process.cwd(), "coverage-e2e");

const EXCLUDE = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /\/src\/main\.tsx$/,
  /\/src\/types\//,
  /\/src\/utils\/logger\.ts$/,
  /\/src\/utils\/notify\.ts$/,
  /\/src\/App\.tsx$/,
];

if (!fs.existsSync(TMP_DIR)) {
  console.error(
    `No coverage data found in ${TMP_DIR}. Run "npm run test:e2e:cov" first.`,
  );
  process.exit(1);
}

const coverageMap = libCoverage.createCoverageMap({});

for (const file of fs.readdirSync(TMP_DIR)) {
  if (!file.endsWith(".json")) continue;

  const data = JSON.parse(fs.readFileSync(path.join(TMP_DIR, file), "utf-8"));

  for (const [filePath, fileCoverage] of Object.entries(data)) {
    const normalizedPath = filePath.split(path.sep).join("/");
    if (EXCLUDE.some((pattern) => pattern.test(normalizedPath))) continue;
    coverageMap.addFileCoverage(fileCoverage);
  }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const context = libReport.createContext({
  dir: OUT_DIR,
  coverageMap,
});

for (const reporter of ["text", "html", "lcov"]) {
  reports.create(reporter).execute(context);
}

fs.rmSync(TMP_DIR, { recursive: true, force: true });

console.log(`E2E coverage report written to ${OUT_DIR}`);
