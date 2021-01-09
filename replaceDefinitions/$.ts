import { CanonicalName, Closure, createMacro, Definition } from "@opah/core";
import { Map } from "@opah/immutable";
import { executeClosureInContext } from "../opah/executeClosureInContext.ts";
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
