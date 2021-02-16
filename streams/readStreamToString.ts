import { Readable } from "stream";

export function readStreamToString(stream: Readable) {
  return new Promise<string>((resolve) => {
    let str = "";
    stream.on("data", (x) => (str += x));
    stream.on("end", () => resolve(str));
  });
}
