import { runScenarios } from "./runScenarios.ts";
import { validatorSpec } from "./spec/index.ts";

export async function test() {
  await runScenarios(validatorSpec);
}
