import {
  VariableDeclarator,
  FunctionDeclaration,
  ClassDeclaration,
  ExportDefaultDeclaration,
} from "@opah/core";

export type ReferencedDefinitionNode =
  | VariableDeclarator
  | FunctionDeclaration
  | ClassDeclaration
  | ExportDefaultDeclaration;
