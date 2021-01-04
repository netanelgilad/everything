import { CanonicalName } from "@depno/core";
import { Set } from "@depno/immutable";
import { EventEmitter } from "events";
import { writeFileSync } from "fs";
import { join } from "path";
import { someDirectory } from "../abstracts/someDirectory.ts";
import { assertThat } from "../assertions/assertThat.ts";
import { is } from "../assertions/is.ts";
import { count } from "../axax/count.ts";
import { fromEmitter } from "../axax/fromEmitter.ts";
import { closure } from "../macros/closure.ts";
import { scenario } from "../validator/scenario.ts";
import { watchFileEmitter } from "../watcher/watchFileEmitter.ts";
import { withCache } from "../withCache.ts";
import { getDefinitionForCanonicalName } from "./getDefinitionForCanonicalName.ts";

async function getReferencesRecursively(
  canonicalNames: Set<CanonicalName>,
  seenNames: Set<CanonicalName> = Set()
): Promise<Set<CanonicalName>> {
  return await canonicalNames.reduce(async (result, reference) => {
    if (seenNames.has(reference)) return Set();
    const definition = await getDefinitionForCanonicalName(reference);
    return (await result).merge(
      await getReferencesRecursively(
        definition.references.valueSeq().toSet(),
        seenNames.concat(canonicalNames)
      )
    );
  }, Promise.resolve(canonicalNames));
}

export const watchCanonicalNames = withCache(async function watchCanonicalNames(
  canonicalNames: Set<CanonicalName>
): Promise<{ stop: () => void; eventEmitter: EventEmitter }> {
  const eventEmitter = new EventEmitter();

  const allReferences = (
    await getReferencesRecursively(canonicalNames)
  ).filter((x) => x.uri.startsWith("/"));
  const referencesWatches = allReferences.map((reference) =>
    watchFileEmitter(reference.uri)
  );

  referencesWatches.forEach((watcher) => {
    watcher.eventEmitter.on("change", () => eventEmitter.emit("change"));
  });

  return {
    stop: () => {
      referencesWatches.forEach((watcher) => watcher.stop());
      eventEmitter.emit("end");
    },
    eventEmitter,
  };
});

export const Spec_watchCanonicalName = [
  scenario({
    description: "should yield once for a change in a deep shared dep",
    verify: closure(async () => {
      const directory = someDirectory();

      writeFileSync(join(directory, "fizz.ts"), `export function fizz() {}`);

      writeFileSync(
        join(directory, "bar.ts"),
        `
          import { fizz } from "./fizz.ts";
    
          export function bar() {
            return fizz();
          }
          `
      );

      writeFileSync(
        join(directory, "baz.ts"),
        `
          import { fizz } from "./fizz.ts";
    
          export function baz() {
            return fizz();
          }
          `
      );

      writeFileSync(
        join(directory, "foo.ts"),
        `
          import { bar } from "./bar.ts";
          import { baz } from "./baz.ts";
    
          export function foo() {
            baz();
            bar();
          }
          `
      );

      const { stop, eventEmitter } = await watchCanonicalNames(
        Set([
          CanonicalName({
            uri: join(directory, "foo.ts"),
            name: "foo",
          }),
        ])
      );

      const iterator = fromEmitter(eventEmitter, "change");

      writeFileSync(join(directory, "fizz.ts"), `export function fizz() { }`);

      stop();

      assertThat(await count(iterator), is(1));
    }),
  }),
];
