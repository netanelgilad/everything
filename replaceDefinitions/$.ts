import { CanonicalName, Closure, createMacro, Definition } from "@depno/core";
import { Map } from "@depno/immutable";
import { executeClosureInContext } from "../depno/executeClosureInContext.ts";
import { replaceInClosure } from "./replaceInClosure.ts";

export const replaceDefinitions = createMacro(
  async <T>(
    nodeClosure: Closure<T>,
    replacementsClosure: Closure<Map<CanonicalName, Definition>>
  ) => {
    const replacements = await executeClosureInContext(replacementsClosure);
    const [updatedClosure, artificialDefinitions] = await replaceInClosure(
      nodeClosure,
      replacements
    );
    return [updatedClosure, artificialDefinitions];
  }
);
