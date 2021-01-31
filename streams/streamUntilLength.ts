import { PassThrough, Readable } from "stream";
import { Buffer } from "buffer";

export function streamUntilLength(stream: Readable, length: number) {
  const result = new PassThrough();
  const overflowPromise = new Promise<Buffer>((resolve) => {
    let seen = 0;
    const listener = (chunk: Buffer) => {
      seen += chunk.length;

      if (seen < length) {
        result.push(chunk);
      } else {
        result.push(chunk.slice(0, length - seen + chunk.length));
        stream.removeListener("data", listener);
        result.end();
        resolve(chunk.slice(length - seen + chunk.length));
      }
    };
    stream.on("data", listener);
  });
  return {
    stream: result,
    overflow: overflowPromise,
  };
}
