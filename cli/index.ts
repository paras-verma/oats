#!/usr/bin/env node
import { logger } from "~/utils/logger.js";
import generateRoutes from "./helpers/generateRoutes.js";
import generateTypes from "./helpers/generateTypes.js";
import generateMongooseModels from "./helpers/generateModels.js";
import parseInputs from "./helpers/parseInputs.js";
import scaffoldProjectRoot from "./helpers/scaffoldProjectRoot.js";
import populateScripts from "./helpers/populateScripts.js";

async function main() {
  logger.info("OATS | OpenApi spec'd Typescript Server Generator");
  logger.disabled("CLI to generate ts based express-server stubs!\n");

  const {
    appName,
    appPath,
    spec,
    flags: { mongoose, service },
  } = await parseInputs();

  await scaffoldProjectRoot(appPath); // populate project root with template-core

  const generatedTypes = await generateTypes(appPath, spec);

  if (mongoose) await generateMongooseModels(appPath, generatedTypes);

  if (service !== "skip") await populateScripts(appPath, service);

  await generateRoutes(spec, appPath);
  console.log({ appName, spec });
}

main().catch((err) => {
  logger.error("Aborting installation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error("An unknown error has occurred. Please open an issue on github with the below:");
    console.log(err);
  }
  process.exit(1);
});
