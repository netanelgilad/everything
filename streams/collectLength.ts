import { Readable } from "stream";
import { tuple } from "../macros/tuple.ts";
import { Buffer } from "buffer";

export async function collectLength(
  stream: Readable,
  length: number
): Promise<[Buffer[], Buffer]> {
  if (length <= 0) {
    return tuple([Buffer.from([])], Buffer.from([]));
  }
  return new Promise((resolve) => {
    const buffers: Buffer[] = [];
    let overflow: Buffer | undefined;
    let currentSize = 0;
    const listener = (chunk: Buffer) => {
      currentSize += chunk.length;

      if (currentSize <= length) {
        buffers.push(chunk);
      } else {
        buffers.push(chunk.slice(0, length - currentSize));
        overflow = chunk.slice(length - currentSize);
        stream.removeListener("data", listener);
        resolve(tuple(buffers, overflow));
      }
    };
    stream.on("data", listener);

    stream.on("end", () => {
      resolve(tuple(buffers, Buffer.from([])));
    });
  });
}
