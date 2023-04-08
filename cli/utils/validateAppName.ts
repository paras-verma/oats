import { exists } from "fs-extra";
import { resolve } from "path";

const validationRegExp = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

//Validate a string against allowed package.json names
export const validateAppName = async (input: string) => {
  const path = resolve(input);
  const paths = path.split("/");
  if (await exists(path)) return `Name collision identified at ${path} \nPlease retry with with a different app-name or abort this process before continuing...`;

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));

  const appFolderName = paths[paths.length - 1];
  let appName = appFolderName;
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  if (validationRegExp.test(appName ?? "")) {
    return true;
  } else {
    return "App name must be lowercase, alphanumeric, and only use -, _, and @";
  }
};

export const projectFolderDetails = (name: string) => {
  const absolutePath = resolve(name);
  const paths = absolutePath.split("/");

  // If the first part is a @, it's a scoped package
  const indexOfDelimiter = paths.findIndex((p) => p.startsWith("@"));

  const appFolderName = paths[paths.length - 1];
  let appName = appFolderName;
  if (paths.findIndex((p) => p.startsWith("@")) !== -1) {
    appName = paths.slice(indexOfDelimiter).join("/");
  }

  return { appName, appPath: `${process.cwd()}/${appFolderName}` };
};
