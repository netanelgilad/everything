import { KeySet, Refine } from "../refine/refine.ts";
import { join as joinFs } from "path";

export type RelativePathString = Refine<string, KeySet<"RelativePath">>;
export type AbsolutePathString = Refine<string, KeySet<"AbsolutePath">>;
export type PathString = RelativePathString | AbsolutePathString;
export type FolderPathString = Refine<PathString, KeySet<"Folder">>;
export type FilePathString = Refine<PathString, KeySet<"File">>;

export type Join<TArgs extends PathString[]> = {
  (...args: TArgs): TArgs extends PathString[]
    ? TArgs extends [...PathString[], FilePathString]
      ? FilePathString
      : PathString
    : never;
};

export const join = joinFs as <T extends PathString[]>(
  ...args: T
) => ReturnType<Join<T>>;
