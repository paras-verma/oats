#!/usr/bin/env node
import { logger } from "~/utils/logger.js";
import generateRoutes from "./helpers/generateRoutes/index.js";
import generateTypes from "./helpers/generateTypes.js";
import generateMongooseModels from "./helpers/generateModels.js";
import parseInputs from "./helpers/parseInputs.js";
import scaffoldProjectRoot from "./helpers/scaffoldProjectRoot.js";
import populateScripts from "./helpers/populateScripts.js";
import modelUpdateWarning from "./helpers/modelsUpdateWarning.js";
import enableGit from "./helpers/enableGIT.js";
import installDependencies from "./helpers/installDependencies.js";

async function main() {
  logger.info("OATS | OpenApi spec'd Typescript Server Generator");
  logger.disabled("CLI to generate ts based express-server stubs!\n");

  const {
    appName,
    appPath,
    spec,
    flags: { mongoose, service, update, noGit, noInstall },
  } = await parseInputs();

  await scaffoldProjectRoot(appPath); // populate project root with template-core

  let store = undefined;
  if (update) store = await modelUpdateWarning(appPath, spec, mongoose);

  const generatedTypes = await generateTypes(appPath, spec, store);

  if (mongoose) await generateMongooseModels(appPath, generatedTypes);

  if (service !== "skip" && !update) await populateScripts(appPath, service);

  await generateRoutes(spec, appPath, Boolean(update));

  if (!noGit && !update) enableGit(appPath);
  if (!noInstall && !update) installDependencies(appPath);
}

main().catch((err) => {
  logger.error("Aborting installation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error("An unknown error has occurred. Please open an issue on github with the below:");
    console.log(err);
  }
  process.exit(0);
});
