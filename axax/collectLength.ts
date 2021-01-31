import { tuple } from "../macros/tuple.ts";
import { Buffer } from "buffer";

export async function collectLength(
  iterator: AsyncIterableIterator<Buffer>,
  length: number
) {
  let current = await iterator.next();
  const buffers: Buffer[] = [];
  let seen = 0;
  while (!current.done) {
    seen += current.value.length;

    if (seen < length) {
      buffers.push(current.value);
    } else {
      buffers.push(
        current.value.slice(0, length - seen + current.value.length)
      );
      const overflow = current.value.slice(
        length - seen + current.value.length
      );
      return tuple(buffers, overflow);
    }
    current = await iterator.next();
  }
  return tuple(buffers, Buffer.from([]));
}
