import { Readable } from "stream";

export function emptyReadable() {
  const readable = new Readable();
  readable.push(null);
  return readable;
}
