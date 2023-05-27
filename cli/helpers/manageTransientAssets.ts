import { mkdtempSync } from "fs";
import { copy } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { PKG_ROOT } from "~/utils/constants.js";
import { execa } from "~/utils/execAsync.js";
import { logger } from "~/utils/logger.js";

export async function generateTransientAssets(apiSpecPath: string) {
  const outputStorePath = join(tmpdir(), "oas-");
  const outputStore = mkdtempSync(outputStorePath);

  // generate interfaces
  logger.info("Generating types..");
  await copy(`${PKG_ROOT}/cli/assets/openapitools.json`, `${process.cwd()}/openapitools.json`);

  const generatorOutput = await execa(`npx @openapitools/openapi-generator-cli generate -g typescript-fetch -i ${apiSpecPath} -o ${outputStore}`); // choose silent if possible

  if (!!generatorOutput.stderr) {
    logger.error("Error occurred while generating types for schema\n");
    logger.warn(generatorOutput.stderr);
    process.exit(1);
  }

  return outputStore;
}
