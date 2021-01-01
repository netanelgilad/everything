import { CanonicalName, Closure, Definition } from "@depno/core";
import { executeProgram } from "@depno/host";
import { Map } from "@depno/immutable";
import { getExecutionProgramForDefinition } from "./executeExpressionWithScope/getExecutionProgramForDefinition/$.ts";

export async function executeClosureInContext<TReturn>(
  closure: Closure<TReturn>,
  artificialDefinitions: Map<CanonicalName, Definition> = Map()
): Promise<TReturn> {
  const program = await getExecutionProgramForDefinition(
    closure,
    artificialDefinitions
  );
  return executeProgram(program);
}
