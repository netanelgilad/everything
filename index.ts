import { depnoSpec } from "./depno/spec/index.ts";
import { depnoshSpec } from "./depnosh/spec/index.ts";
import { runScenarios } from "./validator/runScenarios.ts";

export function test() {
  const repoSpec = [...depnoSpec, ...depnoshSpec];
  runScenarios(repoSpec);
}
