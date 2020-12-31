import { Scenario } from "./scenario.ts";

export async function runScenarios(scenarios: Array<Scenario>) {
  for (const scenario of scenarios) {
    try {
      await scenario.verify();
      console.log(`✅  ${scenario.description}`);
    } catch (err) {
      console.log(`❌  ${scenario.description}`);
      console.log();
      console.log(err);
      console.log();
    }
  }
}
