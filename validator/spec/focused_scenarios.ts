import { stdout } from "@opah/host";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { runScenarios } from "../runScenarios.ts";
import { scenario } from "../scenario.ts";

export const focusedScenariosScenarios = [
  scenario({
    description: "Should run only focused scenarios if some exist",
    verify: closure(async () => {
      const aScenarioDescription = "aScenarioDescription"; // TODO: abstracts - should be some unique string
      const aFocusedScenarioDescription = "aFocusedScenarioDescription"; // TODO: abstracts - should be some unique string
      const aScenario = scenario({
        description: aScenarioDescription,
        verify: closure(async () => {}),
      });

      const aFocusedScenario = scenario({
        description: aFocusedScenarioDescription,
        focus: true,
        verify: closure(async () => {}),
      });

      runScenarios([aScenario, aFocusedScenario]);

      await assertThat(
        stdout,
        willStream(
          `🏃 ${aFocusedScenarioDescription}\n✅  ${aFocusedScenarioDescription}\n`
        )
      );
    }),
  }),
];
