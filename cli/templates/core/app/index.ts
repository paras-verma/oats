import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

function routeResolver(handlersPath: any, route: any, apiDoc: any) {
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

app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, ""),
    validateRequests: true,
    validateResponses: {
      removeAdditional: "failing",
    },
    resolver: routeResolver,
  })
);

export default app;
