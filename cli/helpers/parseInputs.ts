import { Command, Option } from "commander";
import inquirer from "inquirer";
import { logger } from "~/utils/logger.js";
import { validateAppName } from "~/utils/validateAppName.js";
import { serviceOptions } from "~/utils/constants.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
  mongoose: boolean;
  service: "gcf_http" | "gcf_pub_sub" | "aws_lambda" | "aws_lambda_edge" | "skip";
  quick: boolean;
}

interface CliResults {
  appName: string;
  flags: CliFlags;
}

const defaultOptions: CliResults = {
  appName: "ts-express-app",
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    mongoose: false,
    service: "skip",
    quick: false,
  },
};

export default async function () {
  const cliResults = defaultOptions;

  const program = new Command().name("oats");

  program
    .description("A CLI for scaffolding an Express server (Typescript) base on provided OAS 2.*/3.* spec")
    .argument("[dir]", "The name of the application, as well as the name of the directory to create", "ts-server-stub")
    .argument("[spec]", "Path to OAS3.0 file outlying routes and data-schemas")
    .option("--noGit", "Explicitly tells the CLI to not initialize a new git repo in the project", false)
    .option("--noInstall", "Explicitly tells the CLI to not run the package manager's install command", false)
    .option("--mongoose", "Opt-in to generate mongoose models from the supplied OAS3.0 file", false)
    .addOption(new Option("-p, --service <service>", "Service for which the deployment scripts are to be generated").choices([...serviceOptions, "skip"]))
    .option("-y, --default", "Bypass the CLI and use all default options to bootstrap a new app", false)
    .option("-q, --quick", "Runs cli in quick mode with only provided flags", false)
    .version("0.0.0", "-v, --version", "Display the version number")
    .addHelpText(
      "afterAll",
      `\n Note: \n
        - Generated deployment scripts only work for pre-existing resources on the cloud \n
        - Stubs generated for deployment as GCF are by default set to be deployed as gen2 \n`
    )
    .parse(process.argv);

  // Needs to be separated outside the if statement to correctly infer the type as string | undefined
  const cliProvidedName = program.args[0];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }

  // only consider flags if cli isn't running in default mode
  if ((program.opts() as CliFlags).default) cliResults.flags.default = true;
  else cliResults.flags = program.opts();

  try {
    if (!cliResults.flags.quick && !cliResults.flags.default) {
      if (!cliProvidedName) {
        const { appName } = await inquirer.prompt<Pick<CliResults, "appName">>({
          name: "appName",
          type: "input",
          message: "What will your project be called?",
          default: defaultOptions.appName,
          validate: validateAppName,
          transformer: (input: string) => {
            return input.trim();
          },
        });
        cliResults.appName = appName;
      }

      if (!cliResults.flags.mongoose) {
        const { mongoose } = await inquirer.prompt<{ mongoose: boolean }>({
          name: "mongoose",
          type: "confirm",
          message: "Generate mongoose models?",
          default: false,
        });
        if (!mongoose) {
          logger.info("Skipping mongoose model generation.");
        }
      }

      if (cliResults.flags.service !== "skip") {
        const { service } = await inquirer.prompt<Pick<CliFlags, "service">>({
          name: "service",
          type: "list",
          message: "Setup deployment script for which of the following services?",
          choices: [
            { name: "Google Cloud Function (HTTP)", value: "gcf_http" },
            { name: "Google Cloud Function (Pub Sub)", value: "gcf_pub_sub" },
            { name: "AWS Lambda", value: "aws_lambda" },
            { name: "AWS Lambda@Edge", value: "aws_lambda_edge" },
            { name: "Skip", value: "skip" },
          ],
        });
        cliResults.flags.service = service;
      }

      // Skip if noGit flag provided
      if (!cliResults.flags.noGit) {
        const { git } = await inquirer.prompt<{ git: boolean }>({
          name: "git",
          type: "confirm",
          message: "Initialize a new git repository?",
          default: true,
        });
        if (!git) {
          cliResults.flags.noGit = true;
          logger.info(`You can run 'git init' later.`);
        }
      }

      const pkgManager = getUserPkgManager();

      if (!cliResults.flags.noInstall) {
        const { runInstall } = await inquirer.prompt<{ runInstall: boolean }>({
          name: "runInstall",
          type: "confirm",
          message: `Would you like us to run ${pkgManager} install?`,
          default: true,
        });

        if (!runInstall) {
          cliResults.flags.noInstall = true;
          logger.info(`Skipping install. You can run '${pkgManager} install' later to install the dependencies!`);
        }
      }
    }
  } catch (error) {
    // catches errors thrown by inquirer on tty-shells
    if (error instanceof Error && (error as any).isTTYError) {
      logger.warn("This cli needs an interactive terminal");
      if (cliResults.flags.default) logger.info("Bootstraping a ts-server stub with defaults");
      else {
        logger.info("Please run the program in default mode using '--default' flag");
        process.exit(1);
      }
    } else {
      throw error;
    }
  }

  return cliResults;
}
