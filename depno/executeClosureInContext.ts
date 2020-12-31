import { Closure } from "@depno/core";
import { executeProgram } from "@depno/host";
import { getExecutionProgramForDefinition } from "./executeExpressionWithScope/getExecutionProgramForDefinition/$.ts";

export async function executeClosureInContext(closure: Closure) {
  const program = await getExecutionProgramForDefinition(closure);
  return executeProgram(program);
}
