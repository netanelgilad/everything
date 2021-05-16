import { FilePathString } from "./PathString.ts";
import { readFile as readFileFs } from "fs";

export function readFile(path: FilePathString) {
  return new Promise<Buffer>((resolve, reject) => {
    readFileFs(path, (err, contents) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents);
      }
    });
  });
}
