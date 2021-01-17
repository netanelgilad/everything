import { callExpression, identifier } from "@opah/core";
import { writeFileSync } from "fs";
import { join } from "path";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStreamToCompletion } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { executeExpressionWithScope } from "../executeExpressionWithScope/$.ts";

export const reexportScenarios = [
  scenario({
    description: "Should run a function depending on a reexport",
    verify: closure(async () => {
      const directory = someDirectory();

      writeFileSync(
        join(directory, "foo.ts"),
        `
          import {logToConsole} from '@opah/host';
          export function foo() {
              logToConsole("Hello")
          }
          `
      );

      writeFileSync(
        join(directory, "reexport.ts"),
        `
          export { foo } from './foo.ts';
          `
      );

      writeFileSync(
        join(directory, "index.ts"),
        `
          import { foo } from "./reexport.ts";
    
          export function sayHello() {
            foo();
          }
          `
      );

      const process = await executeExpressionWithScope(
        callExpression(identifier("sayHello"), []),
        join(directory, "index.ts"),
        directory
      );

      await assertThat(process.stdout!, willStreamToCompletion("Hello"));
    }),
  }),
];
