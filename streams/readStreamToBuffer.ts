import { Readable } from "stream";
import { Buffer } from "buffer";

export function readStreamToBuffer(stream: Readable) {
  return new Promise<Buffer>((resolve) => {
    const bufs: Buffer[] = [];
    stream.on("data", (x) => bufs.push(x));
    stream.on("end", () => resolve(Buffer.concat(bufs)));
  });
}
