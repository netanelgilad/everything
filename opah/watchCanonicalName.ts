import { CanonicalName } from "@opah/core";
import { Set } from "@opah/immutable";
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
  canonicalNames: Set<CanonicalName>
): Promise<Set<CanonicalName>> {
  let result = Set<CanonicalName>();
  let references = canonicalNames;
  while (references.size > 0) {
    const reference = references.first(false);
    if (!reference) {
      throw new Error("ImpossibleState");
    }
    if (!result.has(reference)) {
      const definitionOfReference = await getDefinitionForCanonicalName(
        reference
      );
      result = result.add(reference);
      references = references.concat(
        definitionOfReference.references.valueSeq().toSet()
      );
    }

    references = references.remove(reference);
  }

  return result;
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
