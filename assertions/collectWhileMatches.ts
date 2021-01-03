import { Readable } from "stream";

export async function collectWhileMatches(
  stream: Readable,
  toMatch: string
): Promise<[boolean, string?]> {
  return new Promise((resolve) => {
    let result = "";
    let currentPosition = 0;

    const listener = (chunk: Buffer) => {
      const chunkAsString = String(chunk);
      result += chunkAsString;
      if (
        toMatch.substr(currentPosition, chunkAsString.length) !== chunkAsString
      ) {
        done(false, result);
      } else {
        currentPosition = currentPosition + chunkAsString.length;
        if (currentPosition >= toMatch.length) {
          done(true, result);
        }
      }
    };

    function done(didMatch: boolean, result: string) {
      stream.removeListener("data", listener);
      resolve([didMatch, result]);
    }

    stream.on("data", listener);
    stream.on("end", () => done(false, result));
    stream.on("close", () => done(false, result));
    stream.on("error", () => done(false, result));
  });
}
