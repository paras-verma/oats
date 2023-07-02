import { copy } from "fs-extra";
import { PKG_ROOT } from "~/utils/constants.js";
import { logger } from "~/utils/logger.js";

export const supportedEnvironmentsForDebugging = ["vscode"];

export default async function setupDebugging(appPath: string, environment: string) {
  if (!supportedEnvironmentsForDebugging.includes(environment)) return;

  if (environment === "vscode") await copy(`${PKG_ROOT}/dist/assets/debugging/${environment}`, appPath);

  await copy(`${PKG_ROOT}/dist/assets/debugging/build.sh`, `${appPath}/build.sh`, { overwrite: true });
  await copy(`${PKG_ROOT}/dist/assets/debugging/nodemon.json`, `${appPath}/nodemon.json`, { overwrite: true });

  logger.success("Setup complete for VS-Code debugging");
}
