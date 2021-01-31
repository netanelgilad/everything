//** Give credit to tar-stream on npmjs */
import { Buffer } from "buffer";
import { PassThrough, Readable } from "stream";
import { collectLength } from "../axax/collectLength.ts";
import { fromNodeStream } from "../axax/fromNodeStream.ts";
import { streamUntilLength } from "../axax/streamUntilLength.ts";
import { unsafeDefined } from "../macros/unsafeDefined.ts";
import { emptyReadable } from "../streams/emptyReadable.ts";
import { decodeHeader } from "./decodeHeader.ts";

export async function* extract(tarStream: Readable) {
  const chunkAsyncIterator = fromNodeStream(tarStream);
  let currentOverflow: Buffer = Buffer.from([]);
  let headerBuffers: Buffer[];
  do {
    if (currentOverflow.length > 0) {
      if (currentOverflow.length >= 512) {
        headerBuffers = [currentOverflow.slice(0, 512)];
        currentOverflow = currentOverflow.slice(512);
      } else {
        const [remaininHeaderBuffers, overflow] = await collectLength(
          chunkAsyncIterator,
          512 - currentOverflow.length
        );
        headerBuffers = [currentOverflow, ...remaininHeaderBuffers];
        currentOverflow = overflow;
      }
    } else {
      const collectedHeader = await collectLength(chunkAsyncIterator, 512);
      currentOverflow = collectedHeader[1];
      headerBuffers = collectedHeader[0];

      if (headerBuffers.length === 0) {
        return;
      }
    }

    const header = unsafeDefined(decodeHeader(Buffer.concat(headerBuffers)));
    if (!header) {
      // just keep going
    } else if (header.type === "file") {
      const fileSize = unsafeDefined(header.size);
      const fileStream = new PassThrough();
      if (currentOverflow.length >= fileSize) {
        const fileContentsBuffer = currentOverflow.slice(0, fileSize);
        yield { entry: header, stream: fileStream };
        fileStream.push(fileContentsBuffer);
        fileStream.end();
        currentOverflow = currentOverflow.slice(
          fileSize + fileOverflow(fileSize)
        );
      } else {
        const { stream: remainingFileStream, overflow } = streamUntilLength(
          chunkAsyncIterator,
          fileSize - currentOverflow.length
        );
        yield { entry: header, stream: fileStream };
        fileStream.push(currentOverflow);
        remainingFileStream.pipe(fileStream);
        currentOverflow = (await overflow).slice(fileOverflow(fileSize));
      }
    } else if (header.type === "directory") {
      yield { entry: header, stream: emptyReadable() };
    }
  } while (headerBuffers.reduce((sum, chunk) => sum + chunk.length, 0) === 512);
}

const fileOverflow = (size: number) => {
  size &= 511;
  return size && 512 - size;
};
