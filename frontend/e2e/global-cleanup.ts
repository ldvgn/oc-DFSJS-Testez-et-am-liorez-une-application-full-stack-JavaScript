import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function globalCleanup() {
  execSync("npm run test:e2e:cleanup", {
    cwd: path.resolve(__dirname, "../../backend"),
    stdio: "inherit",
  });
}
