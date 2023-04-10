const routeFileTemplate = `
import { NextFunction, Router, Request, Response, } from "express";

{{#routes}}
/*
  * path - {{{path}}}
  {{detail}}
*/
export const {{operationId}} = Router.use("/", (request: Request, response: Response, next: NextFunction) => {})
{{/routes}}
`;

export default routeFileTemplate;
