import { load } from "js-yaml";
import { readFile, writeFile } from "fs/promises";
import { mkdirp } from "fs-extra";
import mustache from "mustache";

import { IOpenApiSpec } from "~/interface/oas.js";
import routeFileTemplate from "~/templates/mustache/routes.js";

export default async function (specFilePath: string, appPath: string) {
  const specFileContent = await readFile(specFilePath, { encoding: "utf-8" });

  await mkdirp(`${appPath}/app/routes`);

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

  parsedSpec?.tags.map(async (tag) => {
    const taggedRoutes = routes.filter(({ tag: routeTag }) => routeTag === tag.name);
    const mustachePayload = {
      routes: taggedRoutes,
      detail: function () {
        return this.description || this.summary ? `* description: ${this.description || this.summary}` : "";
      },
    };
    const fileContent = mustache.render(routeFileTemplate, mustachePayload);
    await writeFile(`${appPath}/app/routes/${tag.name}.ts`, fileContent);
  });
}
