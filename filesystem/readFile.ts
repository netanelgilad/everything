import { FilePathString } from "./PathString.ts";
import { readFile as readFileFs } from "fs";

type Encoding = "utf8";
type ContentsForEncoding<T extends Encoding> = T extends "utf8"
  ? string
  : Buffer;

export function readFile<T extends Encoding>(
  path: FilePathString,
  encoding?: T
) {
  return new Promise<ContentsForEncoding<T>>((resolve, reject) => {
    readFileFs(path, encoding, (err, contents) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents as ContentsForEncoding<T>);
      }
    });
  });
}
