import { createMacro } from "@depno/macros";
import { console } from "console";

function createSymbolCallExpression(types, value) {
	return types.callExpression(types.identifier("Symbol"), [
		types.stringLiteral(value),
	]);
}

const LocationBasedSymbol = createMacro(
	({ definitions, definitionCanonicalName, node, types }) => {
		return {
			replacement: createSymbolCallExpression(
				types,
				definitionCanonicalName.uri +
					":" +
					node.loc.start.line +
					":" +
					node.loc.start.column
			),
		};
	}
);

export default () => {
	console.log(LocationBasedSymbol());
};
