import {
  CanonicalName,
  Definition,
  identifier,
  importDeclaration,
  importSpecifier,
  stringLiteral,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { builtinModules } from "module";
import { getDefinitionFromExternalURI } from "./getDefinitionFromExternalURI/$.ts";

const depnoAPIsURIs = [
  ...builtinModules,
  "@depno/core",
  "@depno/host",
  "@depno/immutable",
];

export const getDefinitionForCanonicalName = async (
  canonicalName: CanonicalName,
  artificialDefinitions: Map<CanonicalName, Definition> = Map()
) => {
  if (artificialDefinitions.has(canonicalName)) {
    return artificialDefinitions.get(canonicalName)!;
  } else if (depnoAPIsURIs.includes(canonicalName.uri)) {
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
