import { getASTFromCode, getBindingsStatementsFromFileAST } from "@opah/core";
import { Map } from "@opah/immutable";
import { getContentsFromURI } from "./getContentsFromURI.ts";

export async function getBindingsStatementsInScope(scope: string) {
  const [, code] = await getContentsFromURI(Map(), scope);
  let [, ast] = await getASTFromCode(Map(), code, scope);
  return getBindingsStatementsFromFileAST(ast);
}
