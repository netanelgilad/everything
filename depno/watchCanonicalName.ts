import { CanonicalName } from "@depno/core";
import { fromEmitter } from "../axax/fromEmitter.ts";
import { merge } from "../axax/merge.ts";
import { watchFileEmitter } from "../watcher/watchFileEmitter.ts";
import { withCache } from "../withCache.ts";
import { getDefinitionForCanonicalName } from "./getDefinitionForCanonicalName.ts";

export const watchCanonicalName = withCache(async function* watchCanonicalName(
  canonicalName: CanonicalName
): AsyncIterableIterator<undefined> {
  if (!canonicalName.uri.startsWith("/")) return;

  const definition = await getDefinitionForCanonicalName(canonicalName);
  const referencesDefinitions = await Promise.all(
    definition.references
      .valueSeq()
      .filter((canonicalName) => canonicalName.uri.startsWith("/"))
  );

  const referencesWatches = referencesDefinitions.map((x) =>
    watchCanonicalName(x)
  );
  const allReferencesCWatches = merge(...referencesWatches);

  const fileWatch = fromEmitter<undefined>(
    watchFileEmitter(canonicalName.uri),
    "change"
  );

  yield* merge(fileWatch, allReferencesCWatches);
});
