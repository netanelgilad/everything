import { Closure, createMacro } from "@opah/core";

export const unsafeDefined = createMacro(
  <T>(node: Closure<T | undefined | null>) => {
    return node as Closure<T>;
  }
);
