import { FilePathString } from "./PathString.ts";
import { writeFile as writeFileFs, WriteFileOptions } from "fs";

export function writeFile(
  path: FilePathString,
  contents: string,
  options?: WriteFileOptions
) {
  return new Promise<void>((resolve, reject) => {
    writeFileFs(path, contents, options ?? {}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
