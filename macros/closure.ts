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
} from "@opah/core";
import { Map } from "@opah/immutable";
import { toAST } from "./toAST.ts";

export const closure = createMacro(<T>(nodeClosure: Closure<T>) => {
  return Closure<Closure<T>>({
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
          uri: "@opah/core",
          name: "Closure",
        }),
      ],
      [
        "Map",
        CanonicalName({
          uri: "@opah/immutable",
          name: "Map",
        }),
      ],
      [
        "CanonicalName",
        CanonicalName({
          uri: "@opah/core",
          name: "CanonicalName",
        }),
      ],
    ]),
  });
});
