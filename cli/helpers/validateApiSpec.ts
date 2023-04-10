import { exec } from "child_process";
import { resolve } from "path";
import { PKG_ROOT } from "~/utils/constants.js";
import { fileExists } from "~/utils/index.js";
import { logger } from "~/utils/logger.js";

export default function validateApiSpec(filePath: string) {
  const apiSpecFile = resolve(filePath);

  if (!fileExists(apiSpecFile)) {
    logger.error(`Couldn't locate file at ${apiSpecFile.toString()}`);
    logger.error("Aborting...");
    process.exit(1);
  }

  const { stderr } = exec(`npx openapi-generator-cli validate -i ${apiSpecFile}`, { cwd: PKG_ROOT });

  if (!stderr) {
    logger.error("Invalid spec! \n  Aborting stub generation...");
    logger.info("Please review the provided spec again");
    logger.disabled(stderr);
    process.exit(1);
  }

  logger.success("Valid spec! proceeding...\n");
  return true;
}
