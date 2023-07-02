import { NextFunction, Request, RequestHandler, Response } from "express";

export function exists(json: any, key: string) {
  const value = json[key];
  return value !== null && value !== undefined;
}

export function mapValues(data: any, fn: (item: any) => any) {
  return Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: fn(data[key]) }), {});
}

export function handler(...middlewares: Array<RequestHandler>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let isClosed = false;
    req.on("close", () => {
      isClosed = true;
    });
    try {
      for (const middleware of middlewares) {
        if (isClosed) break;
        await new Promise((resolve, reject) => {
          middleware(req, res, (err: any) => {
            if (err) reject(err);
            else resolve("done");
          });
        });
      }
    } catch (error) {
      next(error);
    }
  };
}
