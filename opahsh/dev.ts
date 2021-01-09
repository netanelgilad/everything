import { buildExecutable } from "@opah/core";
import { Readable, Writable } from "stream";
import { closure } from "../macros/closure.ts";
import { runScenarios } from "../validator/runScenarios.ts";
import { open } from "./open.ts";
import { opahshSpec } from "./spec/index.ts";
import { Map } from "@opah/immutable";
import { stderr, stdout } from "@opah/host";

export function build() {
  buildExecutable(
    closure(() => open(process.stdin, stdout, stderr, process.cwd())),
    {
      target: "host",
      output: "./target/opahsh",
    }
  );
}

export function test() {
  runScenarios(opahshSpec.inMemory);
  runScenarios(opahshSpec.e2e, Map());
}

export function run(stdin: Readable, stdout: Writable, stderr: Writable) {
  open(stdin, stdout, stderr, "/Users/netanelg/Development/opah-shell");
}
