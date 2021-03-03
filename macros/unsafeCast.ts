import { Closure, createMacro } from "@opah/core";

export const unsafeCast = createMacro(
  <Target, From = unknown>(node: Closure<From>) => node as Closure<Target>
);
