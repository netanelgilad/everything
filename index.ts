import { depnoSpec } from "./depno/spec/index.ts";
import { depnoshSpec } from "./depnosh/spec/index.ts";
import { runScenarios } from "./validator/runScenarios.ts";
import { validatorSpec } from "./validator/spec/index.ts";

export function test() {
  const repoSpec = [...depnoSpec, ...depnoshSpec, ...validatorSpec];
  runScenarios(repoSpec);
}
