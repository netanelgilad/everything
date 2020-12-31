import { assertion, Assertion } from "./Assertion.ts";

export function both<TActual>(a: Assertion<TActual>, b: Assertion<TActual>) {
  return assertion<TActual>(async (actual) => {
    await a(actual);
    await b(actual);
  });
}
