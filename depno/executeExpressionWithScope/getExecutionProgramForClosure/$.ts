import {
  CanonicalName,
  classDeclaration,
  Closure,
  Declaration,
  Definition,
  expressionStatement,
  functionDeclaration,
  identifier,
  importDeclaration,
  importSpecifier,
  isClassDeclaration,
  isFunctionDeclaration,
  isVariableDeclaration,
  program,
  replaceReferencesToCanonicalReferences,
  Statement,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} from "@depno/core";
import { List, Map, Set } from "@depno/immutable";
import { builtinModules } from "module";
import { getDefinitionForCanonicalName } from "../../getDefinitionForCanonicalName.ts";
import { canonicalIdentifier } from "./canonicalIdentifier.ts";
import { isMacroDefinition } from "./isMacroDefinition.ts";
import { processMacros } from "./processMacros.ts";

export async function getExecutionProgramForClosure(
  closure: Closure,
  executeArtificialDefinitions: Map<CanonicalName, Definition> = Map()
) {
  let definitions = Map<CanonicalName, Definition>();
  let references = closure.references.valueSeq().toSet();
  while (references.size > 0) {
    const reference = references.first(false);
    if (!reference) {
      throw new Error("ImpossibleState");
    }
    if (!definitions.has(reference)) {
      const definitionOfReference = await getDefinitionForCanonicalName(
        reference,
        executeArtificialDefinitions
      );
      if (!isMacroDefinition(definitionOfReference)) {
        const [updatedDefinition, artificialDefinitions] = await processMacros(
          reference,
          definitionOfReference,
          executeArtificialDefinitions
        );
        definitions = definitions
          .merge(artificialDefinitions)
          .set(
            reference,
            updatedDefinition.set(
              "declaration",
              declarationOfDefinition(reference, updatedDefinition)
            )
          );
        references = references.merge(
          updatedDefinition.references.valueSeq().toSet()
        );
      }
    }

    references = references.remove(reference);
  }

  const [definitionsDeclarations] = getDeclarationsFromBundle(
    definitions,
    closure.references.valueSeq().toSet(),
    Set()
  );

  const replacedExecuteExpression = replaceReferencesToCanonicalReferences(
    closure.expression,
    closure.references
  );

  return program(
    definitionsDeclarations
      .push(expressionStatement(replacedExecuteExpression))
      .toArray(),
    undefined,
    "module"
  );
}

function getDeclarationsFromBundle(
  definitions: Map<CanonicalName, Definition>,
  canonicalNames: Set<CanonicalName>,
  seenDeclarations: Set<CanonicalName>
): [List<Statement>, Set<CanonicalName>] {
  return canonicalNames.reduce(
    ([result, seenDeclarations], canonicalName) => {
      if (seenDeclarations.has(canonicalName)) {
        return [result, seenDeclarations];
      }

      const definition = definitions.get(canonicalName);
      if (!definition) {
        throw new DefinitionNotFoundInBundleError({
          canonicalName,
          definitions,
        });
      }

      const [
        referencesDeclarations,
        updatedSeenDeclarations,
      ] = getDeclarationsFromBundle(
        definitions,
        definition.references
          .valueSeq()
          .toSet()
          .filter((x) => !x.equals(canonicalName)),
        seenDeclarations.add(canonicalName)
      );
      const declaration = declarationOfDefinition(canonicalName, definition);
      return [
        result.concat(referencesDeclarations).push(declaration),
        updatedSeenDeclarations,
      ];
    },
    [List(), seenDeclarations]
  );
}

class DefinitionNotFoundInBundleError extends Error {
  constructor(opts: {
    canonicalName: CanonicalName;
    definitions: Map<CanonicalName, Definition>;
  }) {
    super();
  }
}

const depnoAPIsURIs = [
  ...builtinModules,
  "@depno/core",
  "@depno/host",
  "@depno/immutable",
];

function declarationOfDefinition(
  canonicalName: CanonicalName,
  definition: Definition
) {
  if (depnoAPIsURIs.includes(canonicalName.uri)) {
    return importDeclaration(
      [
        importSpecifier(
          identifier(canonicalIdentifier(canonicalName)),
          identifier(canonicalName.name)
        ),
      ],
      stringLiteral(canonicalName.uri)
    );
  }

  const declarationWithReplacedReferences = replaceReferencesToCanonicalReferences(
    definition.declaration,
    definition.references,
    canonicalName
  );

  const declarationWithCanonicalName = replaceDeclarationId(
    declarationWithReplacedReferences,
    canonicalIdentifier(canonicalName)
  );

  return declarationWithCanonicalName;
}

function replaceDeclarationId(declaration: Declaration, id: string) {
  if (isVariableDeclaration(declaration)) {
    return variableDeclaration("const", [
      variableDeclarator(identifier(id), declaration.declarations[0].init),
    ]);
  } else if (isFunctionDeclaration(declaration)) {
    return functionDeclaration(
      identifier(id),
      declaration.params,
      declaration.body,
      declaration.generator,
      declaration.async
    );
  } else if (isClassDeclaration(declaration)) {
    return classDeclaration(
      identifier(id),
      declaration.superClass,
      declaration.body,
      declaration.decorators
    );
  }
  throw new Error(`Unknown declaration type: ${declaration.type}`);
}
