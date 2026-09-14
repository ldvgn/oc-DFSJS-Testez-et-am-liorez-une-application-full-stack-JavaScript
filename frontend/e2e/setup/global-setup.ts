import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
  const backendDir = path.resolve(__dirname, "../../../backend");

  execSync("npm run db:test:reset", {
    stdio: "inherit",
    cwd: backendDir,
  });
}
