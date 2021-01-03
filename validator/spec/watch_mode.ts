import { CanonicalName, Closure, identifier } from "@depno/core";
import { writeFileSync } from "fs";
import { join } from "path";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { someString } from "../../abstracts/someString.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../scenario.ts";
import { Map } from "@depno/immutable";
import { runScenarios } from "../runScenarios.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { stdout } from "@depno/host";

export const watchModeScenarios = [
  scenario({
    description: "should rerun tests when a dependency file changes",
    verify: closure(async () => {
      const directory = someDirectory();
      writeFileSync(
        join(directory, "foo.ts"),
        `
                export function foo() {
                    return 1;
                }
            `
      );

      writeFileSync(
        join(directory, "scenario.ts"),
        `
                import {strict as assert} from "assert";
                import { foo } from "./foo.ts";
                export function verify() {
                    assert.strictEqual(1, foo())
                }
            `
      );

      const aScenario = scenario({
        description: someString(),
        verify: Closure<() => Promise<unknown>>({
          expression: identifier("scenario"),
          references: Map([
            [
              "scenario",
              CanonicalName({
                uri: join(directory, "scenario.ts"),
                name: "verify",
              }),
            ],
          ]),
        }),
      });

      runScenarios([aScenario]);

      await assertThat(stdout, willStream("🏃 asdasdas\n✅  asdasdas\n"));

      writeFileSync(
        join(directory, "foo.ts"),
        `
      export function foo() {
        return 2;
      }
      `
      );

      await assertThat(
        stdout,
        willStream(
          "🏃 asdasdas\n❌  asdasdas\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n1 !== 2\n\n"
        )
      );
    }),
  }),
];
