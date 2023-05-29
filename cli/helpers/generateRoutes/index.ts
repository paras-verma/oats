import { dump } from "js-yaml";
import { writeFile } from "fs/promises";
import { mkdirp } from "fs-extra";
import mustache from "mustache";

import routeFileTemplate from "~/templates/routes.js";
import evaluateRoutesForGeneration from "./evaluator.js";
import { appendFile } from "fs";
import { logger } from "~/utils/logger.js";

export default async function (specFilePath: string, appPath: string, isUpdate: boolean) {
  if (!isUpdate) await mkdirp(`${appPath}/app/controllers`);

  const { parsedSpec, routes, existingControllers } = await evaluateRoutesForGeneration(specFilePath, appPath, isUpdate);

  await Promise.allSettled(
    parsedSpec?.tags.map(async (tag) => {
      const controllerExists = Boolean(existingControllers?.[tag.name]);
      const taggedRoutes = routes.filter(({ tag: routeTag }) => routeTag === tag.name);

      const mustachePayload = {
        routes: taggedRoutes,
        isNew: !controllerExists,
        detail: function () {
          return this.description || this.summary ? `@description ${this.description || this.summary}` : "";
        },
      };

      const fileContent = mustache.render(routeFileTemplate, mustachePayload);

      if (controllerExists)
        return await appendFile(`${appPath}/app/controllers/${tag.name}.ts`, fileContent, (err) => {
          if (!err) return;
          logger.error("An Error occurred while appending to file: ", `/controllers/${tag.name}.ts`);
          logger.info(err);
          process.exit(1);
        });

      await writeFile(`${appPath}/app/controllers/${tag.name}.ts`, fileContent);
    })
  );

  // populate generated spec @ /api
  await mkdirp(`${appPath}/api`);
  await writeFile(`${appPath}/api/api.yaml`, dump(parsedSpec, { indent: 2, replacer: undefined }), { encoding: "utf-8" });
}
