import {
  callExpression,
  CanonicalName,
  Closure,
  createMacro,
  Identifier,
  identifier,
} from "@opah/core";
import { Map } from "@opah/immutable";
import { toAST } from "./toAST.ts";

export const canonicalNameFn = (node: Closure<any>) => {
  const reference = (node.expression as Identifier).name;
  const referenceCanonicalName = node.references.get(reference)!;
  return Closure<CanonicalName>({
    expression: callExpression(identifier("CanonicalName"), [
      toAST(referenceCanonicalName.toJSON()),
    ]),
    references: Map([
      [
        "CanonicalName",
        CanonicalName({
          uri: "@opah/core",
          name: "CanonicalName",
        }),
      ],
    ]),
  });
};

export const canonicalName = createMacro(canonicalNameFn);
