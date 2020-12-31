import { CanonicalName, Closure, Definition } from "@depno/core";
import { Map, Set } from "@depno/immutable";
import { randomBytes } from "crypto";
import { getDefinitionForCanonicalName } from "../depno/getDefinitionForCanonicalName.ts";

export async function replaceInClosure(
  closure: Closure,
  replacements: Map<CanonicalName, Definition>
) {
  const graph = await dependantsGraoh(closure);
  let artificialCanonicalNames = Map<CanonicalName, CanonicalName>();
  let artificialDefinitions = Map<CanonicalName, Definition>();
  for (const [toReplace, replacement] of replacements) {
    const dependants = allDependants(graph, toReplace);
    for (const dependant of dependants) {
      if (!artificialCanonicalNames.has(dependant)) {
        const artificialCanonicalName = CanonicalName({
          uri: "$" + randomBytes(8).toString("hex"),
          name: "$" + randomBytes(8).toString("hex"),
        });
        artificialCanonicalNames = artificialCanonicalNames.set(
          dependant,
          artificialCanonicalName
        );
        artificialDefinitions = artificialDefinitions.set(
          artificialCanonicalName,
          dependant.equals(toReplace)
            ? replacement
            : await getDefinitionForCanonicalName(dependant)
        );
      }
    }
    for (const [
      canonicalName,
      artificialCanonicalName,
    ] of artificialCanonicalNames) {
      const directDependants = graph.get(canonicalName) ?? Set<CanonicalName>();
      for (const directDependant of directDependants) {
        const artificialDefinition = artificialDefinitions.get(
          artificialCanonicalNames.get(directDependant)!
        )!;
        artificialDefinitions = artificialDefinitions.set(
          artificialCanonicalNames.get(directDependant)!,
          artificialDefinition.set(
            "references",
            artificialDefinition.references.map((x) =>
              x.equals(canonicalName) ? artificialCanonicalName : x
            )
          )
        );
      }
    }
    closure = closure.set(
      "references",
      closure.references.map((x) => artificialCanonicalNames.get(x) ?? x)
    );
  }
  return [closure, undefined, artificialDefinitions] as const;
}

function mergeSets<T>(a: Set<T>, b: Set<T>) {
  return a.merge(b);
}

export async function dependantsGraoh(
  withReferences: { references: Map<string, CanonicalName> },
  seenNodes = Set<CanonicalName>()
) {
  let dependants = Map<CanonicalName, Set<CanonicalName>>();
  for (const reference of withReferences.references.values()) {
    if (!seenNodes.has(reference)) {
      const referenceDefinition = await getDefinitionForCanonicalName(
        reference
      );
      const referenceDepedantsGraph = await dependantsGraoh(
        referenceDefinition,
        seenNodes.add(reference)
      );
      const references = referenceDefinition.references.valueSeq().toSet();
      dependants = dependants
        .mergeWith(mergeSets, Map(references.map((x) => [x, Set([reference])])))
        .mergeWith(mergeSets, referenceDepedantsGraph);
    }
  }
  return dependants;
}

export function allDependants(
  graph: Map<CanonicalName, Set<CanonicalName>>,
  canonicalName: CanonicalName,
  seenNodes = Set<CanonicalName>()
): Set<CanonicalName> {
  if (seenNodes.has(canonicalName)) return Set<CanonicalName>();
  const dependents = graph.get(canonicalName) ?? Set<CanonicalName>();
  return dependents.reduce(
    (result, referenceCanonicalName) => {
      return result.merge(
        allDependants(
          graph,
          referenceCanonicalName,
          seenNodes.add(canonicalName)
        )
      );
    },
    Set<CanonicalName>([canonicalName])
  );
}
