import { buildExecutable } from "@depno/core";
import { Readable, Writable } from "stream";
import { closure } from "../macros/closure.ts";
import { runScenarios } from "../validator/runScenarios.ts";
import { open } from "./open.ts";
import { depnoshSpec } from "./spec/index.ts";

export function build() {
  buildExecutable(
    closure(() => open(process.stdin, process.stdout, process.cwd())),
    {
      target: "host",
      output: "./target/opahsh",
    }
  );
}

export function test() {
  runScenarios(depnoshSpec);
}

export function run(stdin: Readable, stdout: Writable) {
  open(stdin, stdout, "/Users/netanelg/Development/depno-shell");
}
