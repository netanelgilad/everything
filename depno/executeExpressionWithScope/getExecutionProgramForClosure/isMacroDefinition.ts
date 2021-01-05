import {
  CanonicalName,
  Definition,
  isCallExpression,
  isIdentifier,
  isVariableDeclaration,
  VariableDeclaration,
} from "@depno/core";

export function isMacroDefinition(
  definition: Definition
): definition is Definition<VariableDeclaration> {
  return (
    isVariableDeclaration(definition.declaration) &&
    isCallExpression(definition.declaration.declarations[0].init) &&
    isIdentifier(definition.declaration.declarations[0].init.callee) &&
    definition.references.has(
      definition.declaration.declarations[0].init.callee.name
    ) &&
    definition.references
      .get(definition.declaration.declarations[0].init.callee.name)!
      .equals(CanonicalName({ uri: "@depno/core", name: "createMacro" }))
  );
}
