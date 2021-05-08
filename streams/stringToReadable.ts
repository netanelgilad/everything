import { Readable } from "stream";

export function stringToReadable(str: string) {
  const stream = new Readable();
  stream.push(str);
  stream.push(null);
  return stream;
}
