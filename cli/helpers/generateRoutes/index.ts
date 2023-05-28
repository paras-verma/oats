import { dump } from "js-yaml";
import { writeFile } from "fs/promises";
import { mkdirp } from "fs-extra";
import mustache from "mustache";

import routeFileTemplate from "~/templates/mustache/routes.js";
import evaluateRoutesForGeneration from "./evaluator.js";

export default async function (specFilePath: string, appPath: string) {
  await mkdirp(`${appPath}/app/controllers`);

  const { parsedSpec, routes } = await evaluateRoutesForGeneration(specFilePath, appPath);

  await Promise.allSettled(
    parsedSpec?.tags.map(async (tag) => {
      const taggedRoutes = routes.filter(({ tag: routeTag }) => routeTag === tag.name);
      const mustachePayload = {
        routes: taggedRoutes,
        detail: function () {
          return this.description || this.summary ? `* description: ${this.description || this.summary}` : "";
        },
      };
      const fileContent = mustache.render(routeFileTemplate, mustachePayload);
      await writeFile(`${appPath}/app/controllers/${tag.name}.ts`, fileContent);
    })
  );

  // populate generated spec @ /api
  await mkdirp(`${appPath}/api`);
  await writeFile(`${appPath}/api/api.yaml`, dump(parsedSpec, { indent: 2, replacer: undefined }), { encoding: "utf-8" });
}
