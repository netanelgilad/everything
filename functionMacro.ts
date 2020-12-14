import { MacroContext, Node, CallExpression } from "@depno/macros";

export function functionMacro(
	fn: (context: MacroContext, ...args: Node[]) => Node
) {
	return (context: MacroContext) => {
		const callExpression = context.reference.parentPath.node as CallExpression;
		const args = callExpression.arguments;
		const toReplace = fn(context, ...args);
		context.reference.parentPath.replaceWith(toReplace);
	};
}
