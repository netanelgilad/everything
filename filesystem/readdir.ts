import { readdir as readdirFs } from "fs";
import { FolderPathString, RelativePathString } from "./PathString.ts";

export function readdir(path: FolderPathString) {
  return new Promise<RelativePathString[]>((resolve, reject) => {
    readdirFs(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files as RelativePathString[]);
      }
    });
  });
}
