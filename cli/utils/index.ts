import { accessSync, constants } from "fs";

export function fileExists(path) {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}
