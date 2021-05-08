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
} from "@opah/core";
import { Map } from "@opah/immutable";
import { toAST } from "./toAST.ts";

export const definitionFn = (nodeClosure: Closure<any>) => {
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
          uri: "@opah/core",
          name: "Definition",
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
};
export const definition = createMacro(definitionFn);
