import { execSync } from "child_process";

export default function (dir: string) {
  const agent = process.env.npm_config_user_agent;
  const packageManager = agent?.startsWith("yarn") ? "yarn" : agent?.startsWith("pnpm") ? "pnpm" : "npm";

  execSync(`${packageManager} install`, { cwd: dir });
}
