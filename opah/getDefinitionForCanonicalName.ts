import {
  CanonicalName,
  Definition,
  identifier,
  importDeclaration,
  importSpecifier,
  stringLiteral,
} from "@opah/core";
import { Map } from "@opah/immutable";
import { builtinModules } from "module";
import { getDefinitionFromExternalURI } from "./getDefinitionFromExternalURI/$.ts";

const opahAPIsURIs = [
  ...builtinModules,
  "@opah/core",
  "@opah/host",
  "@opah/immutable",
];

export const getDefinitionForCanonicalName = async (
  canonicalName: CanonicalName,
  artificialDefinitions: Map<CanonicalName, Definition> = Map()
) => {
  if (artificialDefinitions.has(canonicalName)) {
    return artificialDefinitions.get(canonicalName)!;
  } else if (opahAPIsURIs.includes(canonicalName.uri)) {
    return Definition({
      declaration: importDeclaration(
        [
          importSpecifier(
            identifier(canonicalName.name),
            identifier(canonicalName.name)
          ),
        ],
        stringLiteral(canonicalName.uri)
      ),
      references: Map(),
    });
  } else {
    return getDefinitionFromExternalURI(canonicalName);
  }
};
