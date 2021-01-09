import { forkProgram } from "@opah/host";
import { writeFileSync } from "fs";
import { join } from "path";
import { stdin, stdout } from "process";
import { PassThrough } from "stream";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { someString } from "../../abstracts/someString.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { getExecutionProgramForClosure } from "../../opah/executeExpressionWithScope/getExecutionProgramForClosure/$.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { open } from "../open.ts";

export const executeFunctionsInMemoryScenarios = [
  scenario({
    description: `should allow running a function from a opah file`,
    verify: closure(async () => {
      const directory = someDirectory();
      const expectedOutput = someString();
      writeFileSync(
        join(directory, "index.ts"),
        `
            import { logToConsole } from "@opah/host";
            export function sayHello() { logToConsole("${expectedOutput}"); }
            `
      );
      const stdin = new PassThrough();
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      open(stdin, stdout, stderr, directory);
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
            import { stderr } from "@opah/host";
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

export const executeFunctionsE2EScenarios = [
  scenario({
    description: "should send SIGINT to program when receiving SIGINT",
    verify: closure(async () => {
      const run = closure(open(stdin, stdout, new PassThrough(), "/"));
      const childProcess = forkProgram(
        await getExecutionProgramForClosure(run),
        "/",
        true
      );
      await assertThat(childProcess.stdout!, willStream("$ "));
      childProcess.stdin!.write(
        "setInterval(() => { console.log('hey') }, 1000)\n"
      );
      childProcess.kill("SIGINT");
      await assertThat(childProcess.stdout!, willStream("\n$ "));
    }),
  }),
];
