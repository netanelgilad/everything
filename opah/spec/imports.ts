import { callExpression, identifier } from "@opah/core";
import { writeFileSync } from "fs";
import { join } from "path";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { executeExpressionWithScope } from "../executeExpressionWithScope/$.ts";

export const importsScenarios = [
  scenario({
    description: "should run with import aliasing",
    verify: closure(async () => {
      const directory = someDirectory();
      writeFileSync(
        join(directory, "index.ts"),
        `
          import { logToConsole as myLog } from "@opah/host";
    
          export function sayHello() {
            myLog("Hello");
          }
          `
      );

      const process = await executeExpressionWithScope(
        callExpression(identifier("sayHello"), []),
        join(directory, "index.ts"),
        directory
      );

      await assertThat(process.stdout!, willStream("Hello"));
    }),
  }),
];
