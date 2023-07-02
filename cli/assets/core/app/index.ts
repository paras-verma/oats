import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { join } from "path";
import express, { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { routesResolver } from "~/utils/routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  OpenApiValidator.middleware({
    apiSpec: join(__dirname, "../api/api.yaml"),
    validateRequests: false,
    validateResponses: false,
    operationHandlers: {
      basePath: join(__dirname, "./controllers"),
      resolver: routesResolver,
    },
  })
);

function errorHandler(err: any, request: Request, response: Response, next: NextFunction) {
  return response.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
};

app.use(errorHandler);

export default app;
