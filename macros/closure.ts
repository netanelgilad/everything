import {
  arrayExpression,
  callExpression,
  CanonicalName,
  Closure,
  createMacro,
  identifier,
  objectExpression,
  objectProperty,
  stringLiteral,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { toAST } from "./toAST.ts";

export const closure = createMacro<(node: any) => Closure>((nodeClosure) => {
  return Closure({
    expression: callExpression(identifier("Closure"), [
      objectExpression([
        objectProperty(identifier("expression"), toAST(nodeClosure.expression)),
        objectProperty(
          identifier("references"),
          callExpression(identifier("Map"), [
            arrayExpression(
              nodeClosure.references
                .toSeq()
                .toArray()
                .map(([localName, canonicalName]) => {
                  return arrayExpression([
                    stringLiteral(localName),
                    callExpression(identifier("CanonicalName"), [
                      toAST(canonicalName.toJSON()),
                    ]),
                  ]);
                })
            ),
          ])
        ),
      ]),
    ]),
    references: Map([
      [
        "Closure",
        CanonicalName({
          uri: "@depno/core",
          name: "Closure",
        }),
      ],
      [
        "Map",
        CanonicalName({
          uri: "@depno/immutable",
          name: "Map",
        }),
      ],
      [
        "CanonicalName",
        CanonicalName({
          uri: "@depno/core",
          name: "CanonicalName",
        }),
      ],
    ]),
  });
});
