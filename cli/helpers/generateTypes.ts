import { mkdtempSync } from "fs";
import { copy } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { execa } from "~/utils/execAsync.js";
import { logger } from "~/utils/logger.js";

export default async function (appPath: string, apiSpecPath: string) {
  const outputStorePath = join(tmpdir(), "oas-");
  const outputStore = mkdtempSync(outputStorePath);

  // generate interfaces
  logger.info("Generating types..");
  const generatorOutput = await execa(`npx @openapitools/openapi-generator-cli generate -g typescript-fetch -i ${apiSpecPath} -o ${outputStore}`); // choose silent if possible

  if (!!generatorOutput.stderr) {
    logger.error("Error occurred while generating types for schema\n");
    logger.warn(generatorOutput.stderr);
    process.exit(1);
  }

  // move them to project root
  await copy(`${outputStore}/models`, `${appPath}/app/interfaces/`);

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
}