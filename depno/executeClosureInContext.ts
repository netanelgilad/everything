import { CanonicalName, Closure, Definition } from "@depno/core";
import { executeProgram } from "@depno/host";
import { Map } from "@depno/immutable";
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
