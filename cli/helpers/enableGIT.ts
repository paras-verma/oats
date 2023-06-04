import { execSync } from "child_process";
import { logger } from "~/utils/logger.js";

export default function enableGit(appPath: string) {
  try {
    if (!verifyGIT(appPath)) return logger.warn("Unable to locate git-executable. Skipping initialization...");
    if (verifyGitInitialization(appPath)) return logger.warn("Git already enabled. Skipping initialization...");

    execSync("git init && git branch -m main", { cwd: appPath });
    return logger.success("Git has been enabled for the project!");
  } catch (error) {
    return logger.error("Failed to initialize Git");
  }
}

function verifyGIT(dir: string) {
  try {
    execSync("git --help", { cwd: dir });
    return true;
  } catch (_error) {
    return false;
  }
}

function verifyGitInitialization(dir: string) {
  try {
    return (
      execSync("git rev-parse --is-inside-work-tree", {
        cwd: dir,
      })
        .toString()
        .trim() === "true"
    );
  } catch (_error) {
    return false;
  }
}
