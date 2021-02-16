import { writeFileSync } from "fs";
import { join } from "path";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStreamToCompletion } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { runFile } from "../runFile.ts";

export const runningFilesScenarios = [
  scenario({
    description:
      "Should run the default export of a file when no exported function name is given",
    verify: closure(async () => {
      const directory = someDirectory();
      writeFileSync(
        join(directory, "index.ts"),
        `
          import { logToConsole } from "@opah/host";
    
          export default () => {
            logToConsole("Hello");
          }
          `
      );

      const childProcess = await runFile(join(directory, "index.ts"));

      await assertThat(childProcess.stdout!, willStreamToCompletion("Hello"));
    }),
  }),

  scenario({
    description: "Should log the result of the function called",
    verify: closure(async () => {
      const directory = someDirectory();
      writeFileSync(
        join(directory, "index.ts"),
        `
          export default () => {
            return "the output"
          }
          `
      );

      const childProcess = await runFile(join(directory, "index.ts"));
      await assertThat(
        childProcess.stdout!,
        willStreamToCompletion("the output")
      );
    }),
  }),
];
