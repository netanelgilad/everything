import { writeFileSync } from "fs";
import { join } from "path";
import { PassThrough } from "stream";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { someString } from "../../abstracts/someString.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { open } from "../open.ts";

export const scenarios = [
  scenario({
    description: `should allow running a function from a depno file`,
    verify: closure(async () => {
      const directory = someDirectory();
      const expectedOutput = someString();
      writeFileSync(
        join(directory, "index.ts"),
        `
            import { logToConsole } from "@depno/host";
            export function sayHello() { logToConsole("${expectedOutput}"); }
            `
      );
      const stdin = new PassThrough();
      const stdout = new PassThrough();
      open(stdin, stdout, new PassThrough(), directory);
      await assertThat(stdout, willStream("$ "));
      stdin.write("sayHello()\n");
      await assertThat(stdout, willStream(expectedOutput));
    }),
  }),

  scenario({
    description: "should stream stderr",
    verify: closure(async () => {
      const directory = someDirectory();
      const expectedOutput = someString();
      writeFileSync(
        join(directory, "index.ts"),
        `
            import { stderr } from "@depno/host";
            export function writeToStderr() { stderr.write("${expectedOutput}") }
            `
      );
      const stdin = new PassThrough();
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      open(stdin, stdout, stderr, someDirectory());
      await assertThat(stdout, willStream("$ "));
      stdin.write(`writeToStderr()\n`);
      await assertThat(stderr, willStream(expectedOutput));
    }),
  }),
];
