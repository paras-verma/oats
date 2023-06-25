import { mkdirp } from "fs-extra";
import { readFile, writeFile } from "fs/promises";

import { logger } from "~/utils/logger.js";
import indexOfLineWithString from "~/utils/indexOfLineWithString.js";

interface IEnumStore {
  [key: string]: string[];
}

export default async function generateMongooseModels(appPath: string, availableTypes: string[]) {
  const typesFilesForConversion = availableTypes.map((name) => name.replace(".ts", ""));

  logger.info("Generating models");

  const enumStore: IEnumStore = {};

  await mkdirp(`${appPath}/app/models`);

  (
    await Promise.allSettled(
      typesFilesForConversion.map(async (fileName) => {
        let fileContent = await readFile(`${appPath}/app/interfaces/${fileName}.ts`, { encoding: "utf-8" });

        // record and store enums (later to be stored in /index)
        const containsEnums = fileContent.includes("enum");
        const enumIdentifiers = containsEnums ? handleEnums(fileContent, enumStore) : null;
        const hasImports = fileContent.includes("} from './'");

        const enumImportStatement = `${!hasImports ? "import { " : "" }${enumIdentifiers?.join(", ")} } from './';\n`;

        // ignore if file only contains enum
        if (containsEnums && !fileContent.includes("export interface")) return;

        // replace utility imports
        fileContent = fileContent.replace(/\s{1}([a-zA-Z])*((From|To)JSON).*/g, "");
        // add enum imports
        if (containsEnums && enumIdentifiers?.length && hasImports) fileContent = fileContent.replace(/} from '\.\/';/gm, enumImportStatement);
        // removes empty imports
        // fileContent = fileContent.replace(/^import\s+(?:(?:\{[^}]*\})|\*)\s+from\s+['"][^'"]+['"];\s*$/gm, "");
        // fix types
        fileContent = fileContent.replace(/\?*:\s(\w+);/g, (_, type) => `: ${type.toUpperCase()[0] + type.slice(1)},`);
        // refactor Array types
        fileContent = fileContent.replace(/\?*:\sArray<(\w+)>;/g, (_, type) => `: [${type.toUpperCase()[0] + type.slice(1)}],`);
        // add type import and export declaration
        fileContent = fileContent.replace(
          /export interface (\w+) {/g,
          (_, name) => `${!hasImports ? enumImportStatement : ""}import { type ${name} as ${name}Type } from "../interfaces/${name}.js";\n\nexport const ${name}Schema = new mongoose.Schema<${name}Type>({`
        );

        const fileContentByLines: string[] = fileContent.split("\n");

        const limitFileContentToIndex = indexOfLineWithString(containsEnums ? "export enum" : "export function", fileContentByLines, "starts-with");

        // limit file-content to interfaces
        fileContentByLines.splice(limitFileContentToIndex);

        // formatting file
        const cleanedContent = fileContentByLines
          .filter((line) => !line.match(/\*/g)) // remove comments
          .filter((line) => !line.match(/import(.)*(utils)/g)) // remove runtime imports
          .filter((line) => {
            const content = Array.from(new Set(line));
            const isEmpty = content.length == 1 && content.includes(" ");
            return !isEmpty;
          }); // remove empty lines

        let currentInterface: string | null = null;
        cleanedContent.forEach((line, index) => {
          if (line.includes("export const")) {
            currentInterface = line.match(/export const (?<interfaceName>\w+) =/).groups.interfaceName.replace("Schema", "");
          }
          if (line === "}") {
            cleanedContent[index] = "});";
            cleanedContent.splice(index + 1, 0, `\nexport const ${currentInterface} = mongoose.model("${currentInterface}", ${currentInterface}Schema, "${currentInterface}");`);
            currentInterface = null;
          }
        });

        cleanedContent[0] = `import mongoose from "mongoose";`;
        await writeFile(`${appPath}/app/models/${fileName}.ts`, cleanedContent.join("\n"), { encoding: "utf-8" });
      })
    )
  ).forEach((data) => {
    if (data.status !== "fulfilled") {
      logger.warn(data.reason);
      process.exit(1);
    }
  });

  const modelFiles = typesFilesForConversion.map((name) => name);
  const indexFileContent = (await readFile(`${appPath}/app/interfaces/index.ts`, { encoding: "utf-8" })).split("\n").filter((line) => {
    const match = line.match(/\.\/(?<entityName>\w+)'/);
    if (!match) return false;
    const entityName = match.groups?.entityName;

    return modelFiles.includes(entityName);
  });

  indexFileContent.push("");
  Object.entries(enumStore).map(([enumIdentifier, values]) => {
    const payload = enumDeclaration(enumIdentifier, values);
    payload.split("\n").forEach((line) => indexFileContent.push(line));
  });

  await writeFile(`${appPath}/app/models/index.ts`, indexFileContent.join("\n"), { encoding: "utf-8" });
}

function handleEnums(fileContent: string, enumStore: IEnumStore) {
  try {
    const enumMetaData = Array.from(fileContent.matchAll(/export enum (?<enumIdentifier>\w+) {/g)).reduce((store, match) => ({...store, [match.groups.enumIdentifier]: match.index}), {});

    Object.entries(enumMetaData).forEach(([enumIdentifier, index]) => {
      const terminatingIndex = fileContent.substring(index as number).indexOf("}");
      const enumDeclaration = fileContent.substring(index as number, index as number + terminatingIndex);

      enumStore[enumIdentifier] = [];

      const matchedResults = enumDeclaration.matchAll(/= '(?<enumValue>\w+)/g);
      Array.from(matchedResults).forEach((match) => enumStore[enumIdentifier].push(match.groups.enumValue));
    });

    return Object.keys(enumMetaData);
  } catch (error) {
    console.log(":", error);
    return null;
  }
}

export const enumDeclaration = (identifier: string, values: string[]) =>
  `export const ${identifier} = {
  type: String,
  enum: [${values.map((value) => `"${value}"`).join(", ")}]
}
`;
