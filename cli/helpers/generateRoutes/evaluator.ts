import { load } from "js-yaml";
import { readFile } from "fs/promises";
import { IOpenApiSpec } from "~/interface/oas.js";

export default async function evaluateRoutesForGeneration(specFilePath: string, appPath: string) {
  const specFileContent = await readFile(specFilePath, { encoding: "utf-8" });

  const parsedSpec = load(specFileContent) as IOpenApiSpec;

  const routes = Object.entries(parsedSpec.paths)
    .map(([path, route]) => {
      return Object.entries(route).map(([method, details]) => ({ path, method, ...details }));
    })
    .flat(1)
    .map((route) => ({
      tag: route?.tags[0] || "index",
      path: route.path,
      operationId: route?.operationId || route?.path.replaceAll("/", "_").replaceAll("{", "_").replaceAll("}", ""),
      description: route?.description,
      summary: route?.summary,
    }));

  return { parsedSpec, routes, existingControllers: undefined };
}
