import { buildExecutable } from "@depno/core";
import { Readable, Writable } from "stream";
import { inMemoryHost } from "../in_memory_host/$.ts";
import { closure } from "../macros/closure.ts";
import { replaceDefinitions } from "../replaceDefinitions/$.ts";
import { runScenarios } from "../validator/runScenarios.ts";
import { open } from "./open.ts";
import { depnoshSpec } from "./spec/index.ts";

export function build() {
  buildExecutable(
    closure(() => open(process.stdin, process.stdout, process.cwd())),
    {
      target: "host",
      output: "./target/depnosh",
    }
  );
}

export function test() {
  const inMemorySpec = replaceDefinitions(depnoshSpec, inMemoryHost);
  runScenarios(inMemorySpec);
}

export function run(stdin: Readable, stdout: Writable) {
  open(stdin, stdout, "/Users/netanelg/Development/depno-shell");
}
