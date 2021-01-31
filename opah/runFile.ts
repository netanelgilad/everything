import {
  callExpression,
  CanonicalName,
  Closure,
  expressionStatement,
  identifier,
  memberExpression,
  stringLiteral,
} from "@opah/core";
import { forkProgram } from "@opah/host";
import { ChildProcess } from "child_process";
import { resolve } from "path";
import { getExecutionProgramForClosure } from "./executeExpressionWithScope/getExecutionProgramForClosure/$.ts";
import { Map } from "@opah/immutable";

export async function runFile(
  path: string,
  opts: {
    exportedFunctionName?: string;
    args?: any[];
    cwd?: string;
    silent?: boolean;
  } = {}
): Promise<ChildProcess> {
  const silent = opts.silent ?? true;
  const args = opts.args ?? [];
  const exportedFunctionName = opts.exportedFunctionName ?? "default";
  const uri = path.startsWith(".")
    ? resolve(opts.cwd || process.cwd(), path)
    : path;

  const functionCanonicalName = CanonicalName({
    uri,
    name: exportedFunctionName,
  });

  return executeCanonicalName(functionCanonicalName, args, {
    cwd: opts.cwd,
    silent,
  });
}

async function executeCanonicalName(
  canonicalName: CanonicalName,
  args: any[] = [],
  opts: {
    cwd?: string;
    silent?: boolean;
  } = {
    silent: true,
  }
) {
  const mappedArgs = args.map((x) => {
    if (x === "__stdin__") {
      return memberExpression(identifier("process"), identifier("stdin"));
    } else if (x === "__stdout__") {
      return memberExpression(identifier("process"), identifier("stdout"));
    } else if (x === "__stderr__") {
      return memberExpression(identifier("process"), identifier("stderr"));
    } else {
      return stringLiteral(typeof x === "string" ? x : JSON.stringify(x));
    }
  });

  const mainFunctionName = "main";

  const { expression } = expressionStatement(
    callExpression(identifier(mainFunctionName), mappedArgs)
  );

  const program = await getExecutionProgramForClosure(
    Closure({
      expression,
      references: Map([[mainFunctionName, canonicalName]]),
    })
  );

  return forkProgram(program, opts.cwd || process.cwd());
}
