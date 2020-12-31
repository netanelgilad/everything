import {
  callExpression,
  CanonicalName,
  Closure,
  createMacro,
  Identifier,
  identifier,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { toAST } from "./toAST.ts";

export const canonicalName = createMacro<(node: any) => CanonicalName>(
  (node) => {
    const reference = (node.expression as Identifier).name;
    const referenceCanonicalName = node.references.get(reference)!;
    return Closure({
      expression: callExpression(identifier("CanonicalName"), [
        toAST(referenceCanonicalName.toJSON()),
      ]),
      references: Map([
        [
          "CanonicalName",
          CanonicalName({
            uri: "@depno/core",
            name: "CanonicalName",
          }),
        ],
      ]),
    });
  }
);
