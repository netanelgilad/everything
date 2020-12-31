import {
  Node,
  isVariableDeclarator,
  isFunctionDeclaration,
  isClassDeclaration,
  isExportDefaultDeclaration,
} from "@depno/core";
import { ReferencedDefinitionNode } from "./ReferencedDefinitionNode.ts";

export function isReferencedDefinitionNode(
  node: Node
): node is ReferencedDefinitionNode {
  return (
    isVariableDeclarator(node) ||
    isFunctionDeclaration(node) ||
    isClassDeclaration(node) ||
    isExportDefaultDeclaration(node)
  );
}
