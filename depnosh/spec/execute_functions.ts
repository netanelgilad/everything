import { writeFileSync } from "fs";
import { join } from "path";
import { PassThrough } from "stream";
import { assertThat } from "../../assertions/assertThat.ts";
import { willStream } from "../../assertions/willStream.ts";
import { scenario } from "../../validator/scenario.ts";
import { open } from "../open.ts";

export const scenarios = [
  scenario({
    description: `should allow running a function from a depno file`,
    verify: async () => {
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
      open(stdin, stdout, directory);
      await assertThat(stdout, willStream("$ "));
      stdin.write("sayHello()\n");
      await assertThat(stdout, willStream(expectedOutput));
    },
  }),
];

function someDirectory() {
  return "/tmp/asdsad";
}

function someString() {
  return "asdasdas";
}
