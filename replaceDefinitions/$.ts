import { CanonicalName, createMacro, Definition } from "@depno/core";
import { Map } from "@depno/immutable";
import { executeClosureInContext } from "../depno/executeClosureInContext.ts";
import { replaceInClosure } from "./replaceInClosure.ts";

export const replaceDefinitions = createMacro<
  <T>(node: T, replacements: Map<CanonicalName, Definition>) => T
>(async (nodeClosure, replacementsClosure) => {
  const replacements = await executeClosureInContext(replacementsClosure);
  const [updatedClosure, _, artificialDefinitions] = await replaceInClosure(
    nodeClosure,
    replacements
  );
  return [updatedClosure, artificialDefinitions];
});
