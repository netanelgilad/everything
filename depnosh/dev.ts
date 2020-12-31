import { buildExecutable } from "@depno/core";
import { closure } from "../macros/closure.ts";
import { open } from "./open.ts";

export function build() {
  buildExecutable(
    closure(() => open(process.stdin, process.stdout, process.cwd())),
    {
      target: "host",
      output: "./target/depnosh",
    }
  );
}
