import serverlessExpress from "@vendia/serverless-express";
import app from "./src/app";

exports.handler = serverlessExpress({ app });
