import {
  arrowFunctionExpression,
  awaitExpression,
  callExpression,
  CanonicalName,
  Closure,
  expressionStatement,
  identifier,
  memberExpression,
  stringLiteral,
} from "@opah/core";
import { forkProgram } from "@opah/host";
import { Map } from "@opah/immutable";
import { ChildProcess } from "child_process";
import { resolve } from "path";
import { getExecutionProgramForClosure } from "./executeExpressionWithScope/getExecutionProgramForClosure/$.ts";

export async function runFile(
  path: string,
  opts: {
    exportedFunctionName?: string;
    args?: any[];
    cwd?: string;
  } = {}
): Promise<ChildProcess> {
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
  });
}

async function executeCanonicalName(
  name: CanonicalName,
  args: any[] = [],
  opts: {
    cwd?: string;
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
    callExpression(
      arrowFunctionExpression(
        [],
        callExpression(identifier("logToConsole"), [
          awaitExpression(
            callExpression(identifier(mainFunctionName), mappedArgs)
          ),
        ]),
        true
      ),
      []
    )
  );

  const program = await getExecutionProgramForClosure(
    Closure({
      expression,
      references: Map([
        [mainFunctionName, name],
        [
          "logToConsole",
          CanonicalName({ uri: "@opah/host", name: "logToConsole" }), // this should be using the canonicalName macro, but since the macro isn't calculated at the correct time at the moment, and the logToConsole reference can be replaced under the hood
        ],
      ]),
    })
  );

  return forkProgram(program, opts.cwd || process.cwd());
}
