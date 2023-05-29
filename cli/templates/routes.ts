const routeFileTemplate = `{{#isNew}}
import { NextFunction, Router, Request, Response, } from "express";
{{/isNew}}
{{#routes}}

/*
  @path {{{path}}}
  {{detail}}
*/
export const {{operationId}} = Router.use("/", (request: Request, response: Response, next: NextFunction) => {})
{{/routes}}
`;

export default routeFileTemplate;
