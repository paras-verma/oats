import { copy } from "fs-extra";
import { PKG_ROOT } from "~/utils/constants.js";

export default async function (appPath: string) {
  await copy(`${PKG_ROOT}/cli/templates/core`, appPath);
}
