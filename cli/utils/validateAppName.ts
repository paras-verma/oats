import { logger } from "./logger.js";

const validationRegExp = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

//Validate a string against allowed package.json names
export const validateAppName = (input: string) => {
  const paths = input.split("/");

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));

  const appFolderName = paths[paths.length - 1];
  let appName = appFolderName;
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  if (input.includes("./")) {
    logger.warn(`This package doesn't support relative urls in the path name.`);
    logger.info(`Scaffolding ${appName} project at ${process.cwd()}/${appFolderName}`);
  }

  if (validationRegExp.test(appName ?? "")) {
    return true;
  } else {
    return "App name must be lowercase, alphanumeric, and only use -, _, and @";
  }
};

export const projectFolderDetails = (name: string) => {
  const paths = name.split("/");

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));

  const appFolderName = paths[paths.length - 1];
  let appName = appFolderName;
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  return { appName, appPath: `${process.cwd()}/${appFolderName}` };
};
