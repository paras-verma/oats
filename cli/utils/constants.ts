import path from "path";
import { fileURLToPath } from "url";

export const serviceOptions = ["gcf_http", "gcf_pub_sub", "aws_lambda", "aws_lambda_edge"] as const;

const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");