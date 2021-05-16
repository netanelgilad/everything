import { lstat } from "./lstat.ts";
import { PathString } from "./PathString.ts";

export async function isFile(path: PathString) {
  const stats = await lstat(path);
  return stats.isFile();
}
