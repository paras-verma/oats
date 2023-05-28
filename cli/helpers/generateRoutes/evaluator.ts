import { load } from "js-yaml";
import { readFile } from "fs/promises";
import { IOpenApiSpec } from "~/interface/oas.js";
import { parseFile } from "@swc/core";

export default async function evaluateRoutesForGeneration(specFilePath: string, appPath: string, isUpdate: Boolean) {
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

  if (!isUpdate) return { parsedSpec, routes, existingControllers: undefined };

  const existingControllers: { [key: string]: any } = {};

  await Promise.all(
    parsedSpec.tags.map(async (tag) => {
      const fileExports: string[] = [];

      const controllerAST = await parseFile(`${appPath}/app/controllers/${tag.name}.ts`, {
        syntax: "typescript",
        target: "es2020",
      });

      controllerAST.body.forEach((node: any) => {
        if (!node.type.startsWith("Export")) return;

        if (node.declaration.type === "VariableDeclaration") node.declaration.declarations.forEach((declarator) => fileExports.push(declarator.id.value));
        else if (node.declaration.type === "FunctionDeclaration") fileExports.push(node.declaration.id.value);
      });

      existingControllers[tag.name] = fileExports;
    })
  );

  const routesForUpdate = routes.filter((route) => !Boolean(existingControllers?.[route.tag]?.includes(route.operationId)));

  return { parsedSpec, routes: routesForUpdate, existingControllers };
}
