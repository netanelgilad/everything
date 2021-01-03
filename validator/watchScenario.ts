import { merge } from "../axax/merge.ts";
import { watchCanonicalName } from "../depno/watchCanonicalName.ts";
import { Scenario } from "./scenario.ts";

export async function* watchScenario(scenario: Scenario) {
  yield scenario;
  for await (const _ of merge(
    ...scenario.verify.references.valueSeq().map((x) => watchCanonicalName(x))
  )) {
    yield scenario;
  }
}
