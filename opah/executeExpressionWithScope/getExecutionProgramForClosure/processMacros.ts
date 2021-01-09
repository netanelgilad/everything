import {
  arrowFunctionExpression,
  assertExpression,
  callExpression,
  CallExpression,
  CanonicalName,
  Closure,
  Definition,
  getOutOfScopeReferences,
  identifier,
  isIdentifier,
  replaceNodesByType,
} from "@opah/core";
import { Map } from "@opah/immutable";
import { executeClosureInContext } from "../../executeClosureInContext.ts";
import { getDefinitionForCanonicalName } from "../../getDefinitionForCanonicalName.ts";
import { canonicalIdentifier } from "./canonicalIdentifier.ts";
import { isMacroDefinition } from "./isMacroDefinition.ts";

export async function processMacros(
  canonicalName: CanonicalName,
  definition: Definition,
  excuteArtificialDefinitions: Map<CanonicalName, Definition> = Map()
): Promise<[Definition, Map<CanonicalName, Definition>]> {
  let artificialDefinitions = Map<CanonicalName, Definition>();
  let macros = Map<string, CanonicalName>();
  for (const [reference, referenceCanonicalName] of definition.references) {
    if (
      !referenceCanonicalName.equals(canonicalName) &&
      !referenceCanonicalName.equals(
        CanonicalName({
          uri: "@opah/core",
          name: "createMacro",
        })
      ) &&
      isMacroDefinition(
        await getDefinitionForCanonicalName(
          referenceCanonicalName,
          excuteArtificialDefinitions
        )
      )
    ) {
      macros = macros.set(reference, referenceCanonicalName);
    }
  }

  const macrosFunctions = Map(
    await Promise.all(
      macros
        .entrySeq()
        .map(
          async ([, macro]) =>
            [
              macro,
              await getMacroFunction(macro, excuteArtificialDefinitions),
            ] as [CanonicalName, MacroFunction]
        )
    )
  );

  const replacedDeclaration = await replaceNodesByType(
    definition.declaration,
    "CallExpression",
    async (callExpression: CallExpression) => {
      if (
        isIdentifier(callExpression.callee) &&
        macrosFunctions.has(
          definition.references.get(callExpression.callee.name)!
        )
      ) {
        const argsDefinitions = callExpression.arguments.map(
          (argExpression) => {
            assertExpression(argExpression);

            const argReferences = getOutOfScopeReferences(argExpression).reduce(
              (result, reference) => {
                if (definition.references.has(reference)) {
                  result = result.set(
                    reference,
                    definition.references.get(reference)!
                  );
                }
                return result;
              },
              Map<string, CanonicalName>()
            );

            return Closure({
              expression: argExpression,
              references: argReferences,
            });
          }
        );

        let replacement = await macrosFunctions.get(
          definition.references.get(callExpression.callee.name)!
        )!(...argsDefinitions);

        if (Array.isArray(replacement)) {
          artificialDefinitions = artificialDefinitions.merge(replacement[1]);
          replacement = replacement[0];
        }

        const conflicts = replacement.references.filter(
          (canonicalName, localName) =>
            definition.references.has(localName) &&
            !definition.references.get(localName)!.equals(canonicalName)
        );

        let referencesToMerge = replacement.references;
        let expressionToReplace;

        if (conflicts.size > 0) {
          expressionToReplace = wrapClosureWithIIFE(
            Closure({
              expression: replacement.expression,
              references: conflicts,
            })
          );
          referencesToMerge = replacement.references.mapEntries(
            ([localName, canonicalName]) => {
              if (conflicts.has(localName)) {
                return [canonicalIdentifier(canonicalName), canonicalName];
              } else {
                return [localName, canonicalName];
              }
            }
          );
        } else {
          expressionToReplace = replacement.expression;
        }

        definition = definition.set(
          "references",
          definition.references.merge(referencesToMerge)
        );

        return expressionToReplace;
      }
      return undefined;
    }
  );

  definition = definition.set("declaration", replacedDeclaration);
  definition = definition.set(
    "references",
    definition.references.removeAll(macros.keys())
  );

  return [definition, artificialDefinitions];
}

const getMacroFunction = async (
  macroCanonicalName: CanonicalName,
  excuteArtificialDefinitions: Map<CanonicalName, Definition>
) => {
  const definition = await getDefinitionForCanonicalName(
    macroCanonicalName,
    excuteArtificialDefinitions
  );
  if (!isMacroDefinition(definition)) {
    throw new NonMacroDefinitionError({ canonicalName: macroCanonicalName });
  }
  const macroFunction = (definition.declaration.declarations[0]
    .init! as CallExpression).arguments[0];
  assertExpression(macroFunction);
  return (await executeClosureInContext(
    Closure({
      expression: macroFunction,
      references: definition.references,
    }),
    excuteArtificialDefinitions
  )) as MacroFunction;
};

class NonMacroDefinitionError extends Error {
  constructor({ canonicalName }: { canonicalName: CanonicalName }) {
    super(`Non macro definition: ${canonicalName}`);
  }
}

type MaybePromise<T> = T | Promise<T>;

type MapToClosure<T> = { [K in keyof T]: Closure<T[K]> };

export type MacroFunction<
  T extends any[] = unknown[],
  TReturn extends any = unknown
> = (
  ...args: MapToClosure<T>
) => MaybePromise<
  Closure<TReturn> | [Closure<TReturn>, Map<CanonicalName, Definition>]
>;

function wrapClosureWithIIFE(closure: Closure) {
  return callExpression(
    arrowFunctionExpression(
      closure.references
        .keySeq()
        .map((reference) => identifier(reference))
        .toArray(),
      closure.expression
    ),
    closure.references
      .valueSeq()
      .map(canonicalIdentifier)
      .map((x) => identifier(x))
      .toArray()
  );
}
