import { AssertionError } from "assert";
import { assertion, Assertion } from "./Assertion.ts";

export function not<TActual>(a: Assertion<TActual>) {
  return assertion<TActual>(async (actual) => {
    try {
      await a(actual);
    } catch (err) {
      if (!(err instanceof AssertionError)) {
        throw err;
      }
    }
  });
}
