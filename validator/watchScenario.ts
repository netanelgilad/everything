import { fromEmitter } from "../axax/fromEmitter.ts";
import { watchCanonicalNames } from "../depno/watchCanonicalName.ts";
import { Scenario } from "./scenario.ts";

export async function* watchScenario(scenario: Scenario) {
  yield scenario;
  const referencesWatcher = await watchCanonicalNames(
    scenario.verify.references.valueSeq().toSet()
  );
  for await (const _ of fromEmitter(referencesWatcher.eventEmitter, "change")) {
    yield scenario;
  }
}
