import {
	arrayExpression,
	booleanLiteral,
	callExpression,
	CanonicalName,
	createMacro,
	Definition,
	executeDefinitionInContext,
	Expression,
	getDefinitionForCanonicalName,
	Identifier,
	identifier,
	nullLiteral,
	NumericLiteral,
	objectExpression,
	objectProperty,
	stringLiteral,
} from "@depno/core";
import { Map } from "@depno/immutable";
// import { runningFunctionScenario } from "./open.ts";
// import { Scenario } from "./scenario.ts";
// import { functionMacro } from "./functionMacro.ts";
// import { writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";

// export async function runScenariosImpl(
// 	scenarios: Array<ReturnType<typeof scenario>>
// ) {
// 	for (const scenario of scenarios) {
// 		try {
// 			await scenario.verify();
// 		} catch (err) {
// 			console.log("A scenario has failed:");
// 			console.log(scenario.description);
// 			console.log();
// 			console.log(err);
// 			console.log();
// 		}
// 	}
// }

// type Bundle = {
// 	expression?: Expression;
// 	definitions: Array<DefinitionNode>;
// };

// function getValue(path: Path<Node>) {
// 	const pathBundle = bundlePath(path);
// 	return executeBundle(pathBundle);
// }

// export const runScenarios = createMacro<
// 	(scenarions: Scenario[], impls: Map<string, ExecutionBundle>) => Promise<void>
// >(<[Scenario[], Map<string, string>]>(async (
// 	scenarios: ExecutionBundle<Scenario[]>,
// 	impls: ExecutionBundle<Map<string, string>>
// ) => {
// 	const implsValue = await executeBundle(impls);
// 	const scenariosBundle = bundle(scenariosPath, impls);
// 	const runScenariosImplBundle = bundlePath(runScenariosImpl);

// 	return undefined as any;
// 	return {
// 		replace: callExpression(canonicalName(runScenariosImpl), [
// 			scenariosBundle.expression,
// 		]),
// 		definitions: [
// 			...scenariosBundle.definitions,
// 			...runScenariosImplBundle.definitions,
// 		],
// 	};
// }));

// const bundleDefinitions: (node: any) => {} = Function;

const FilesystemState = { filesystem: Map<string, string>() };

function toAST(obj: any): Expression {
	if (typeof obj === "object") {
		if (obj instanceof Array) {
			return arrayExpression(obj.map(toAST));
		} else if (obj === null) {
			return nullLiteral();
		} else {
			return objectExpression(
				Object.entries(obj).map(([key, value]) =>
					objectProperty(identifier(key), toAST(value))
				)
			);
		}
	} else if (typeof obj === "string") {
		return stringLiteral(obj);
	} else if (typeof obj === "number") {
		return <NumericLiteral>{
			type: "NumericLiteral",
			value: obj,
		};
	} else if (typeof obj === "undefined") {
		return identifier("undefined");
	} else if (typeof obj === "boolean") {
		return booleanLiteral(obj);
	} else {
		throw new Error("unknown " + typeof obj);
	}
}

const canonicalName = createMacro<(node: any) => CanonicalName>((node) => {
	const reference = (node.expression as Identifier).name;
	const referenceCanonicalName = node.references.get(reference)!;
	return Definition({
		expression: callExpression(identifier("CanonicalName"), [
			toAST(referenceCanonicalName.toJSON()),
		]),
		references: Map([
			[
				"CanonicalName",
				CanonicalName({
					uri: "@depno/core",
					name: "CanonicalName",
				}),
			],
		]),
	});
});

const definition = createMacro<(node: any) => Definition>((nodeBundle) => {
	return Definition({
		expression: callExpression(identifier("Definition"), [
			objectExpression([
				objectProperty(identifier("expression"), toAST(nodeBundle.expression)),
				objectProperty(
					identifier("references"),
					callExpression(identifier("Map"), [
						arrayExpression(
							nodeBundle.references
								.toSeq()
								.toArray()
								.map(([localName, canonicalName]) => {
									return arrayExpression([
										stringLiteral(localName),
										callExpression(identifier("CanonicalName"), [
											toAST(canonicalName.toJSON()),
										]),
									]);
								})
						),
					])
				),
			]),
		]),
		references: Map([
			[
				"Definition",
				CanonicalName({
					uri: "@depno/core",
					name: "Definition",
				}),
			],
			[
				"Map",
				CanonicalName({
					uri: "@depno/immutable",
					name: "Map",
				}),
			],
			[
				"CanonicalName",
				CanonicalName({
					uri: "@depno/core",
					name: "CanonicalName",
				}),
			],
		]),
	});
});

async function replaceInDefinition(
	definition: Definition,
	replacemenets: Map<CanonicalName, Definition>,
	artificialDefinitions: Map<
		CanonicalName,
		{ canonicalName: CanonicalName; definition: Definition }
	>,
	definitionCanonicalName?: CanonicalName
) {
	return await definition.references.reduce(
		async (prevPromise, canonicalName, localName) => {
			let [
				definition,
				replacemenets,
				artificialDefinitions,
			] = await prevPromise;
			const referenceResult = await replaceInDefinition(
				await getDefinitionForCanonicalName(canonicalName),
				replacemenets,
				artificialDefinitions,
				canonicalName
			);

			const replacement = referenceResult[1].get(canonicalName);

			if (replacement) {
				let artificialDefinition = referenceResult[2].get(canonicalName);

				if (!artificialDefinition) {
					const replacementArtificialCanonicalName = CanonicalName({
						uri: "$" + randomBytes(8).toString("hex"),
						name: "$" + randomBytes(8).toString("hex"),
					});
					artificialDefinition = {
						canonicalName: replacementArtificialCanonicalName,
						definition: replacement,
					};
					artificialDefinitions = referenceResult[2].set(
						canonicalName,
						artificialDefinition
					);
				}

				definition = definition.set(
					"references",
					definition.references.set(
						localName,
						artificialDefinition.canonicalName
					)
				);

				if (definitionCanonicalName) {
					replacemenets = replacemenets.set(
						definitionCanonicalName,
						definition
					);
				}
			}

			return [definition, replacemenets, artificialDefinitions] as const;
		},
		Promise.resolve([definition, replacemenets, artificialDefinitions] as const)
	);
}

const bundleWithReplacements = createMacro<
	<T>(node: T, replacements: Map<CanonicalName, Definition>) => T
>(async (nodeDefinition, replacementsDefinition) => {
	const replacements = await executeDefinitionInContext(replacementsDefinition);
	const [
		updatedDefinition,
		_,
		artificialDefinitions,
	] = await replaceInDefinition(nodeDefinition, replacements, Map());
	return [
		updatedDefinition,
		artificialDefinitions.mapEntries(([, { canonicalName, definition }]) => [
			canonicalName,
			definition,
		]),
	];
});

// export async function test() {
// 	await runScenarios(
// 		[runningFunctionScenario],
// 		new Map([
// 			[
// 				canonicalIdentifier(writeFileSync),
// 				bundle((path: string, contents: string) => {
// 					Filesystem.set(path, contents);
// 				}),
// 			],
// 		])
// 	);
// }

function writeMyData(data: string) {
	writeFileSync("./data", data);
}

function readMyData() {
	return readFileSync("./data", "utf8");
}

function foo() {
	writeMyData("hello");
	return readMyData();
}

export default () => {
	// const original = writeMyData;
	const replaced = bundleWithReplacements(
		foo,
		Map([
			[
				canonicalName(writeFileSync),
				definition((path: string, contents: string) => {
					FilesystemState.filesystem = FilesystemState.filesystem.set(
						path,
						contents
					);
				}),
			],
			[
				canonicalName(readFileSync),
				definition((path: string) => {
					return FilesystemState.filesystem.get(path);
				}),
			],
		])
	);
	// original("original");
	console.log(replaced());
};
