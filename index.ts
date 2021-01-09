import { opahSpec } from "./opah/spec/index.ts";
import { opahshSpec } from "./opahsh/spec/index.ts";
import { runScenarios } from "./validator/runScenarios.ts";
import { validatorSpec } from "./validator/spec/index.ts";
import { Map } from "@opah/immutable";

export function test() {
  const inMemoryRepoSpec = [
    ...opahSpec,
    ...opahshSpec.inMemory,
    ...validatorSpec,
  ];
  runScenarios(inMemoryRepoSpec);
  const e2eRepoSpec = [...opahshSpec.e2e];
  runScenarios(e2eRepoSpec, Map());
}
