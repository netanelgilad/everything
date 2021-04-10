import {
  CanonicalName,
  classExpression,
  functionExpression,
  getOutOfScopeReferences,
  Identifier,
  ImportSpecifier,
  isClassDeclaration,
  isFunctionDeclaration,
  isImportDeclaration,
  isImportSpecifier,
  isVariableDeclarator,
  Node,
  Statement,
} from "@opah/core";
import { Map } from "@opah/immutable";
import { ReferencedDefinitionNode } from "./ReferencedDefinitionNode.ts";
import { resolveURIFromDependency } from "./resolveURIFromDependency.ts";

export function getReferencesFromReferencedDefinitionNode(
  declaration: ReferencedDefinitionNode,
  scope: string,
  bindingsStatementsInScope: Map<string, Statement>
) {
  return Map(
    getOutOfScopeReferences(withoutId(declaration))
      .flatMap((reference) => {
        const bindingStatement = bindingsStatementsInScope.get(reference);
        if (!bindingStatement) {
          if (globals.includes(reference)) {
            return [];
          } else {
            throw new Error(`definition not found ${reference}`);
          }
        }

        const name = !isImportDeclaration(bindingStatement)
          ? reference
          : ((bindingStatement.specifiers.find(
              (specifier) =>
                isImportSpecifier(specifier) &&
                specifier.local.name === reference
            ) as ImportSpecifier)?.imported as Identifier).name ?? reference;

        return [
          [
            reference,
            CanonicalName({
              name,
              uri: isImportDeclaration(bindingStatement)
                ? resolveURIFromDependency(bindingStatement.source.value, scope)
                : scope,
            }),
          ] as [LocalName, CanonicalName],
        ];
      })
      .toArray()
  );
}

const globals = [
  "undefined",
  "parseInt",
  "Date",
  "Promise",
  "eval",
  "JSON",
  "console",
  "require",
  "Error",
  "Object",
  "Array",
  "encodeURIComponent",
  "isFinite",
  "setTimeout",
  "Map",
  "escape",
  "Int32Array",
  "String",
  "process",
  "Symbol",
  "Math",
  "Number",
  "RegExp",
  "Infinity",
  "setImmediate",
];

type LocalName = string;

function withoutId(node: ReferencedDefinitionNode): Node {
  if (isFunctionDeclaration(node)) {
    return functionExpression(
      null,
      node.params,
      node.body,
      node.generator,
      node.async
    );
  } else if (isClassDeclaration(node)) {
    return classExpression(null, node.superClass, node.body, node.decorators);
  } else if (isVariableDeclarator(node)) {
    if (!node.init) {
      throw new Error("node without init");
    }
    return node.init;
  } else {
    return node.declaration;
  }
}
