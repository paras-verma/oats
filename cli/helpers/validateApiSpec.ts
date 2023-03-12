import { exec } from "child_process";
import { lstatSync } from "fs";
import path from "path";
import { PKG_ROOT } from "~/utils/constants.js";
import { execa } from "~/utils/execAsync.js";
import { fileExists } from "~/utils/index.js";
import { logger } from "~/utils/logger.js";

function validateFilePath(filePath: string) {
  // Regular expression to match a valid file-path
  const regex = /^([a-zA-Z]:)?([\\/][\w-]+)+\.[\w]+$/;

  return regex.test(filePath);
}

const specFilePath = (filePath: string) => {
  if (!validateFilePath(filePath)) throw new Error("Invalid path to required OAS3.0 schema file");

  // if just a filename is provided (e.g. api.yaml, oas.yaml) the prepend current working directory path for resolution
  if (filePath && !filePath?.includes("/")) return path.join(__dirname, filePath);

  return filePath || path.join(__dirname, "api.yaml");
};

export default function validateApiSpec(filePath: string) {
  logger.info("Validating OAS3.0 schema file...");
  const apiSpecFile = specFilePath(filePath);

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

  logger.success("Valid spec! proceeding...");
  return true;
}
