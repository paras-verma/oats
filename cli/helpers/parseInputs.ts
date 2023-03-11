import { Command, Option } from "commander";
import { serviceOptions } from "~/utils/constants.js";

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

  return cliResults;
}
