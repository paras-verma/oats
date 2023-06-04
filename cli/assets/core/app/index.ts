import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import path from "path";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { routesResolver } from "./utils/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, "./api/api.yaml"),
    validateRequests: true,
    validateResponses: {
      removeAdditional: "failing",
    },
    resolver: routesResolver,
  })
);

export default app;
