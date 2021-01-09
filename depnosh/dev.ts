import { buildExecutable } from "@depno/core";
import { Readable, Writable } from "stream";
import { closure } from "../macros/closure.ts";
import { runScenarios } from "../validator/runScenarios.ts";
import { open } from "./open.ts";
import { depnoshSpec } from "./spec/index.ts";
import { Map } from "@depno/immutable";
import { stderr, stdout } from "@depno/host";

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
  runScenarios(depnoshSpec.inMemory);
  runScenarios(depnoshSpec.e2e, Map());
}

export function run(stdin: Readable, stdout: Writable, stderr: Writable) {
  open(stdin, stdout, stderr, "/Users/netanelg/Development/depno-shell");
}
