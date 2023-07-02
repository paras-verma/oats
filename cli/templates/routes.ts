const routeFileTemplate = `{{#isNew}}
import { NextFunction, Request, Response } from "express";
import { handler } from "~/utils/routes.js";
{{/isNew}}
{{#routes}}

/**
  @path {{{path}}}
  {{detail}}
**/
export const {{operationId}} = handler((request: Request, response: Response, next: NextFunction) => {})
{{/routes}}
`;

export default routeFileTemplate;
