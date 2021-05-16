import { PathString } from "./PathString.ts";
import { lstat as lstatFs, Stats } from "fs";

export function lstat(path: PathString) {
  return new Promise<Stats>((resolve, reject) => {
    lstatFs(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}
