import {
  CanonicalName,
  Closure,
  Expression,
  getOutOfScopeReferences,
} from "@opah/core";
import { forkProgram } from "@opah/host";
import { Map } from "@opah/immutable";
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
