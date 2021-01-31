import { PassThrough } from "stream";
import { Buffer } from "buffer";

export function streamUntilLength(
  iterator: AsyncIterableIterator<Buffer>,
  length: number
) {
  const result = new PassThrough();
  const overflowPromise = new Promise<Buffer>(async (resolve) => {
    let current = await iterator.next();
    let seen = 0;
    let found = false;
    while (!current.done && !found) {
      seen += current.value.length;

      if (seen < length) {
        result.push(current.value);
        current = await iterator.next();
      } else {
        found = true;
      }
    }

    if (found) {
      result.push(current.value.slice(0, length - seen + current.value.length));
      result.end();
      resolve(current.value.slice(length - seen + current.value.length));
    } else {
      result.end();
      resolve(Buffer.from([]));
    }
  });
  return {
    stream: result,
    overflow: overflowPromise,
  };
}
