import {
  arrayExpression,
  CanonicalName,
  Closure,
  createMacro,
  Definition,
} from "@opah/core";
import { canonicalNameFn } from "../macros/canonicalName.ts";
import { definitionFn } from "../macros/definition.ts";

export const replacementTuple = createMacro(
  <T>(node: Closure<T>, replacement: Closure<T>) => {
    const nodeCanonicalName = canonicalNameFn(node);
    const replacementDefinition = definitionFn(replacement);
    return Closure<[CanonicalName, Definition]>({
      expression: arrayExpression([
        nodeCanonicalName.expression,
        replacementDefinition.expression,
      ]),
      references: nodeCanonicalName.references.merge(
        replacementDefinition.references
      ),
    });
  }
);
