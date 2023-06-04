import { NextFunction, Request, Response, RequestHandler } from "express";
import path from "path";

export function routesResolver(handlersPath: any, route: any, apiDoc: any) {
  const pathKey = route.openApiRoute.substring(route.basePath.length);
  const schema = apiDoc.paths[pathKey][route.method.toLowerCase()];

  const controller = schema["tags"]?.[0];
  const method = schema["operationId"];
  const modulePath = path.join(handlersPath, controller);
  const handler = require(modulePath);

  if (handler[method] === undefined) {
    throw new Error(`Could not find a [${method}] function in ${modulePath} when trying to route [${route.method} ${route.expressRoute}].`);
  }
  return handler[method];
}

export function handler(...middlewares: Array<RequestHandler>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const middleware of middlewares) {
      await middleware(req, res, next);
    }
  };
}