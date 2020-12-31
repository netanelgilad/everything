import { Readable, Writable } from "stream";
import { open } from "./depnosh/open.ts";
import { depnoshSpec } from "./depnosh/spec/index.ts";
import { inMemoryHost } from "./in_memory_host/$.ts";
import { replaceDefinitions } from "./replaceDefinitions/$.ts";
import { runScenarios } from "./validator/runScenarios.ts";

export function test() {
  const inMemorySpec = replaceDefinitions(depnoshSpec, inMemoryHost);
  runScenarios(inMemorySpec);
}

function run(stdin: Readable, stdout: Writable) {
  open(stdin, stdout, "/Users/netanelg/Development/depno-shell");
}
