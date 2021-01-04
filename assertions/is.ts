import { assertion } from "./Assertion.ts";
import { strict as assert } from "assert";

export function is<T>(expected: T) {
  return assertion((actual: T) => assert.strictEqual(actual, expected));
}
