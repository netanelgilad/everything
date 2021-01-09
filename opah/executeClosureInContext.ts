import { CanonicalName, Closure, Definition } from "@opah/core";
import { executeProgram } from "@opah/host";
import { Map } from "@opah/immutable";
import { getExecutionProgramForClosure } from "./executeExpressionWithScope/getExecutionProgramForClosure/$.ts";

export async function executeClosureInContext<TReturn>(
  closure: Closure<TReturn>,
  artificialDefinitions: Map<CanonicalName, Definition> = Map()
): Promise<TReturn> {
  const program = await getExecutionProgramForClosure(
    closure,
    artificialDefinitions
  );
  return executeProgram(program);
}
