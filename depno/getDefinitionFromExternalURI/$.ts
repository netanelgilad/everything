import {
  CanonicalName,
  Declaration,
  Definition,
  identifier,
  Identifier,
  isClassDeclaration,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isExportSpecifier,
  isExpression,
  isFunctionDeclaration,
  isVariableDeclarator,
  variableDeclaration,
  variableDeclarator,
} from "@depno/core";
import { getBindingsStatementsInScope } from "../executeExpressionWithScope/getBindingsStatementsInScope.ts";
import { getReferencesFromDeclaration } from "./getReferencesFromExpression.ts";
import { isReferencedDefinitionNode } from "./isReferencedDefinitionNode.ts";
import { ReferencedDefinitionNode } from "./ReferencedDefinitionNode.ts";
import { resolveURIFromDependency } from "./resolveURIFromDependency.ts";

export async function getDefinitionFromExternalURI(
  canonicalName: CanonicalName
): Promise<Definition> {
  const bindingsStatements = await getBindingsStatementsInScope(
    canonicalName.uri
  );
  const bindingStatement = bindingsStatements.get(canonicalName.name);

  if (!bindingStatement) {
    throw new Error(
      `Failed to find binding for ${canonicalName.name} at ${canonicalName.uri}`
    );
  }

  if (isExportNamedDeclaration(bindingStatement)) {
    return getDefinitionFromExternalURI(
      CanonicalName({
        uri: resolveURIFromDependency(
          bindingStatement.source!.value,
          canonicalName.uri
        ),
        name: (bindingStatement.specifiers.find(
          (specifier) =>
            isExportSpecifier(specifier) &&
            specifier.local.name === canonicalName.name
        )!.exported as Identifier).name,
      })
    );
  } else if (!isReferencedDefinitionNode(bindingStatement)) {
    throw new Error(
      `Cannot bundle a non reference definition of node. The node type requested was ${bindingStatement.type}`
    );
  }

  const declaration = getDeclarationFromReferencedDefinitionNode(
    bindingStatement
  );

  const references = getReferencesFromDeclaration(
    declaration,
    canonicalName.uri,
    bindingsStatements
  );

  return Definition({
    declaration,
    references,
  });
}

function getDeclarationFromReferencedDefinitionNode(
  node: ReferencedDefinitionNode
): Declaration {
  if (isVariableDeclarator(node)) {
    if (!node.init) {
      throw new Error("node with init");
    }
    return variableDeclaration("const", [node]);
  } else if (isFunctionDeclaration(node)) {
    return node;
  } else if (isClassDeclaration(node)) {
    return node;
  } else if (isExportDefaultDeclaration(node)) {
    if (isExpression(node.declaration)) {
      return variableDeclaration("const", [
        variableDeclarator(identifier("default"), node.declaration),
      ]);
    }

    return node.declaration;
  }
  return node;
}
