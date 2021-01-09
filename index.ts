import { depnoSpec } from "./depno/spec/index.ts";
import { depnoshSpec } from "./depnosh/spec/index.ts";
import { runScenarios } from "./validator/runScenarios.ts";
import { validatorSpec } from "./validator/spec/index.ts";
import { Map } from "@depno/immutable";

export function test() {
  const inMemoryRepoSpec = [
    ...depnoSpec,
    ...depnoshSpec.inMemory,
    ...validatorSpec,
  ];
  runScenarios(inMemoryRepoSpec);
  const e2eRepoSpec = [...depnoshSpec.e2e];
  runScenarios(e2eRepoSpec, Map());
}
