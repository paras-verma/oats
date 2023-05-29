import app from "./app/index";

const entryPoint = (request: any, response: any) => {
  if (!request.path) {
    request.url = `/${request.url}`; // prepend '/' to keep query params if any
  }
  return app(request, response);
};

export { entryPoint };
