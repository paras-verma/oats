import { copy } from "fs-extra";
import type { CliFlags } from "./parseInputs.js";
import { PKG_ROOT } from "~/utils/constants.js";

export default async function populateScripts(appPath: string, service: CliFlags["service"]) {
  const vendor = service.split("_")[0];

  await copy(`${PKG_ROOT}/cli/templates/entrypoint/${vendor}.ts`, `${appPath}/app.prod.ts`, { overwrite: true });
  await copy(`${PKG_ROOT}/cli/templates/scripts/${service}`, appPath);
}
