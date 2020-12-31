import { Readable } from "stream";
import { assertion } from "./Assertion.ts";
import { strict as assert } from "assert";
import { collectWhileMatches } from "./collectWhileMatches.ts";

export function willStream(expected: string) {
  return assertion(async (actual: Readable) => {
    assert.ok((await collectWhileMatches(actual, expected))[0]);
  });
}
