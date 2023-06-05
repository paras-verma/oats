import { execSync } from "child_process";

export const getPackageManager = () => {
  const agent = process.env.npm_config_user_agent;
  return agent?.startsWith("yarn") ? "yarn" : agent?.startsWith("pnpm") ? "pnpm" : "npm";
};

export default function (dir: string) {
  const packageManager = getPackageManager();
  execSync(`${packageManager} install`, { cwd: dir });
}
