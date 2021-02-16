import { Readable } from "stream";
import { assertion } from "./Assertion.ts";
import { strict as assert } from "assert";
import { collectWhileMatches } from "./collectWhileMatches.ts";

export function willStream(expected: string) {
  return assertion(async (actual: Readable) => {
    assert.strictEqual(
      (await collectWhileMatches(actual, expected))[1],
      expected
    );
  });
}

export function willStreamToCompletion(expected: string) {
  return assertion(async (actual: Readable) => {
    let result = "";
    let currentPosition = 0;
    for await (const chunk of actual) {
      const chunkAsString = String(chunk);
      result += chunkAsString;
      currentPosition += chunkAsString.length;

      assert.strictEqual(
        expected.substr(0, currentPosition),
        result.substr(0, currentPosition)
      );
    }
    assert.strictEqual(result.length, expected.length);
  });
}
