import {
  CanonicalName,
  Definition,
  identifier,
  importDeclaration,
  importSpecifier,
  nullLiteral,
  stringLiteral,
} from "@depno/core";
import { Map } from "@depno/immutable";
import { builtinModules } from "module";
import { withCache } from "../withCache.ts";
import { getDefinitionFromExternalURI } from "./getDefinitionFromExternalURI/$.ts";

const depnoAPIsURIs = [
  ...builtinModules,
  "@depno/core",
  "@depno/host",
  "@depno/immutable",
];

export const getDefinitionForCanonicalName = withCache(
  async (canonicalName: CanonicalName) => {
    if (depnoAPIsURIs.includes(canonicalName.uri)) {
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
  }
);
