import {
  CanonicalName,
  Declaration,
  getOutOfScopeReferences,
  isImportDeclaration,
  Statement,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { resolveURIFromDependency } from "./resolveURIFromDependency.ts";

export function getReferencesFromDeclaration(
  declaration: Declaration,
  scope: string,
  bindingsStatementsInScope: Map<string, Statement>
) {
  return Map(
    getOutOfScopeReferences(declaration)
      .flatMap((reference) => {
        const bindingStatement = bindingsStatementsInScope.get(reference);
        if (!bindingStatement) {
          if (globals.includes(reference)) {
            return [];
          } else {
            throw new Error(`definition not found ${reference}`);
          }
        }
        return [
          [
            reference,
            CanonicalName({
              name: reference,
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
];

type LocalName = string;
