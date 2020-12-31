import {
  VariableDeclarator,
  FunctionDeclaration,
  ClassDeclaration,
  ExportDefaultDeclaration,
} from "@depno/core";

export type ReferencedDefinitionNode =
  | VariableDeclarator
  | FunctionDeclaration
  | ClassDeclaration
  | ExportDefaultDeclaration;
