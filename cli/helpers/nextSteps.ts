import { logger } from "~/utils/logger.js";
import { getPackageManager } from "./installDependencies.js";

export default function nextSteps(appName: string, noInstall: boolean, vendor: string) {
  logger.success("Project scaffolding completed! \n");
  const packageManager = getPackageManager();

  const nextSteps = [`You may now proceed to ${appName}`];
  if (noInstall) nextSteps.push(`Install dependencies: ${packageManager} install`);
  nextSteps.push(`Start development server: ${packageManager} run dev`);
  if (vendor !== "skip") nextSteps.push(`| Note: Please setup required resources first and deploy using \`${packageManager} run deploy\``);

  logger.info(nextSteps.join("\n"));
}
