import { copy } from "fs-extra";
import type { CliFlags } from "./parseInputs.js";
import { PKG_ROOT } from "~/utils/constants.js";
import { logger } from "~/utils/logger.js";

export default async function populateScripts(appPath: string, service: CliFlags["service"]) {
  const vendor = service.split("_")[0];

  await copy(`${PKG_ROOT}/dist/assets/entrypoint/${vendor}.ts`, `${appPath}/app.prod.ts`, { overwrite: true });
  await copy(`${PKG_ROOT}/dist/assets/scripts/${service}`, appPath);

  logger.success("Deployment assets setup completed!");
}
