import path from "path";

const handlerCache: any = {};

export function routesResolver(handlersPath: any, route: any, apiDoc: any) {
  const pathKey = route.openApiRoute;
  const schema = apiDoc.paths[pathKey][route.method.toLowerCase()];

  const controller = schema["tags"]?.[0];
  const method = schema["operationId"];
  const modulePath = path.join(handlersPath, controller);
  const cacheKey = `${controller}-${method}`;

  handlerCache[cacheKey] = import(`${modulePath}.ts`);
  return async (req: any, res: any, next: any) => {
    await handlerCache[cacheKey]
      .then((module: any) => {
        if (!module.default[method]) throw Error(`Could not find ${method} @ ${modulePath}`);

        return module.default[method](req, res, () => {});
      })
      .catch(next);
  };
}
