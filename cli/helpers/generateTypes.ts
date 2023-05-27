import { rm } from "fs";
import { copy } from "fs-extra";
import { execa } from "~/utils/execAsync.js";
import { handleError } from "~/utils/index.js";
import { logger } from "~/utils/logger.js";
import { generateTransientAssets } from "./manageTransientAssets.js";

export default async function (appPath: string, apiSpecPath: string) {
  const outputStore = await generateTransientAssets(apiSpecPath);

  const generatedTypes: string[] = [];
  // move them to project root
  await copy(`${outputStore}/models`, `${appPath}/app/interfaces/`, { filter: (src, dest) => !!generatedTypes.push(src) });

  // correct runtime imports to /utils
  logger.info("Updating generated type...");
  // execSync(`sed -i 's|../runtime|~/utils/runtime|g' ${storePath}/models/*`);
  const replacerOutput = await execa(`npx replace-in-file '../runtime' '~/utils/index.js' ${appPath}/app/interfaces/**`);
  if (replacerOutput.stderr) {
    logger.error("Error occurred while modifying interfaces\n");
    logger.warn(replacerOutput.stderr);
    process.exit(1);
  }

  logger.success("Types generated at `/models`");
  await rm(outputStore, { force: true, recursive: true }, (error) => {
    if (!error) return;
    handleError("Failed to remove transient assets", error);
  });
  await rm(`${process.cwd()}/openapitools.json`, { force: true }, (error) => {
    if (!error) return;
    handleError("Failed to remove transient assets", error);
  });

  return generatedTypes.map((file) => file.split("/models/")[1]).filter((item) => !!item);
}
