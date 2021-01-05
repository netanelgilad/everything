import {
  CanonicalName,
  Closure,
  Expression,
  getOutOfScopeReferences,
} from "@depno/core";
import { forkProgram } from "@depno/host";
import { Map } from "@depno/immutable";
import { getExecutionProgramForClosure } from "./getExecutionProgramForClosure/$.ts";
import { getExportedNamesInScope } from "./getExportedNamesInScope.ts";

export async function executeExpressionWithScope(
  expression: Expression,
  scope: string,
  cwd: string
) {
  const namesInScope = await getExportedNamesInScope(scope);
  const referencesInExpression = getOutOfScopeReferences(expression);
  const executionProgram = await getExecutionProgramForClosure(
    Closure({
      expression,
      references: Map(
        namesInScope
          .filter((x) => referencesInExpression.includes(x))
          .map((x) => [
            x,
            CanonicalName({
              name: x,
              uri: scope,
            }),
          ])
      ),
    })
  );
  return forkProgram(executionProgram, cwd, true);
}
