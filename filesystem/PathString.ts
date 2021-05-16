import { KeySet, Refine } from "../refine/refine.ts";
import { join as joinFs } from "path";

export type RelativePathString = Refine<string, KeySet<"RelativePath">>;
export type AbsolutePathString = Refine<string, KeySet<"AbsolutePath">>;
export type PathString = RelativePathString | AbsolutePathString;
export type FolderPathString = Refine<PathString, KeySet<"Folder">>;
export type FilePathString = Refine<PathString, KeySet<"File">>;

export const join = joinFs as (...args: PathString[]) => PathString;
