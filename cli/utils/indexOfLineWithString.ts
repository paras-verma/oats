type TMode = "has" | "equals" | "starts-with" | "ends-with";

const indexOfLineWithString = (searchTerm: string, payload: string[], mode: TMode): number | undefined => {
  if (!["has", "equals", "starts-with", "ends-with"].includes(mode)) throw Error(`Invalid argument for mode: ${mode}\n Acceptable arguments: has, equals, starts-with, ends-with`);

  const identifier = Math.random().toString().split(".")[1];

  const limitFileContentToIndex = payload.reduce((prev, curr, index) => {
    if (prev.includes(identifier.toString()) && parseInt(prev)) return prev;

    const comparison =
      mode === "has" ? "includes" : mode === "equals" ? (string: string) => curr === string : mode === "ends-with" ? "endsWith" : mode === "starts-with" ? "startsWith" : null;

    if (typeof comparison !== "string") return comparison(searchTerm) ? `${identifier}` : curr;
    if (curr[comparison](searchTerm)) return `${identifier}-${index}`;
    return curr;
  });

  if (limitFileContentToIndex.includes(identifier.toString())) return parseInt(limitFileContentToIndex.replace(`${identifier}-`, ""));
  return undefined;
};

export default indexOfLineWithString;
