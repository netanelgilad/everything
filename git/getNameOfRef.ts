import { KeySet, Refine } from "../refine/refine.ts";

export const gitRefFormat = /^refs\/(heads|tags)\/(?<name>.*)$/g;

/**
 * A GitRef is a string known to be in the format of @see {@link gitRefFormat}
 */
export type GitRef = Refine<string, KeySet<"GitRef">>;

export function getNameOfRef(gitRef: GitRef) {
  return gitRefFormat.exec(gitRef)!.groups!.name;
}
