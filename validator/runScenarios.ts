import { logToConsole } from "@depno/host";
import { executeClosureInContext } from "../depno/executeClosureInContext.ts";
import { inMemoryHost } from "../in_memory_host/$.ts";
import { replaceInClosure } from "../replaceDefinitions/replaceInClosure.ts";
import { Scenario } from "./scenario.ts";

export async function runScenarios(scenarios: Array<Scenario>) {
  for (const scenario of scenarios) {
    try {
      const inMemoryVerifyFn = await executeClosureInContext(
        ...(await replaceInClosure(scenario.verify, inMemoryHost))
      );

      await inMemoryVerifyFn();

      console.log(`✅  ${scenario.description}`);
    } catch (err) {
      console.log(`❌  ${scenario.description}`);
      console.log();
      console.log(err);
      console.log();
    }
  }
}
