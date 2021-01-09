import { getBindingsStatementsInScope } from "./getBindingsStatementsInScope.ts";

export async function getExportedNamesInScope(scope: string) {
  const bindings = await getBindingsStatementsInScope(scope);
  return bindings.keySeq().toSet();
}
