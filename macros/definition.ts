import {
  arrayExpression,
  callExpression,
  CanonicalName,
  Closure,
  createMacro,
  Definition,
  identifier,
  objectExpression,
  objectProperty,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { toAST } from "./toAST.ts";

export const definition = createMacro((nodeClosure: Closure<any>) => {
  return Closure<Definition>({
    expression: callExpression(identifier("Definition"), [
      objectExpression([
        objectProperty(
          identifier("declaration"),
          toAST(
            variableDeclaration("const", [
              variableDeclarator(
                identifier("anonymous"),
                nodeClosure.expression
              ),
            ])
          )
        ),
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
        "Definition",
        CanonicalName({
          uri: "@depno/core",
          name: "Definition",
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
