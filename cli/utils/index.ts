import { accessSync, constants } from "fs";
import { logger } from "./logger.js";

export function fileExists(path) {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function handleError(message: string, error: Error) {
  logger.warn(message);
  logger.info(error);
  process.exit(1);
}

export const cleanupFileNames = (data: string | string[]) => (Array.isArray(data) ? data : [data]).map((fileName) => fileName.replace(/\.\w$/g, ""));
