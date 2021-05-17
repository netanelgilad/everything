import {
  buildExecutable,
  callExpression,
  Closure,
  identifier,
  memberExpression,
} from "@opah/core";
import { join } from "path";
import { FilePathString } from "../filesystem/PathString.ts";
import { closure } from "../macros/closure.ts";
import { runScenarios } from "../validator/runScenarios.ts";
import { downloadOpahHost } from "./downloadOpahHost.ts";
import { getExecutionProgramForClosure } from "./executeExpressionWithScope/getExecutionProgramForClosure/$.ts";
import { runFile } from "./runFile.ts";
import { opahSpec } from "./spec/index.ts";

export async function build(
  target: "host" | "node14-linux" | "node14-macos" = "host",
  outputPath: FilePathString = `target/${target}/opah` as FilePathString
) {
  const opahClosure = closure(async (argv: string[]) => {
    const fileToRun = argv[2];
    const exportedFunctionName = argv[3];
    const parameters = argv.slice(4);
    await runFile(fileToRun, {
      exportedFunctionName,
      args: parameters.map((x) => {
        if (x === "{stdin}") {
          return "__stdin__";
        } else if (x === "{stdout}") {
          return "__stdout__";
        } else if (x === "{stderr}") {
          return "__stderr__";
        } else {
          return JSON.parse(x);
        }
      }),
      silent: false,
    });
  });
  const executeExpression = callExpression(opahClosure.expression, [
    memberExpression(identifier("process"), identifier("argv")),
  ]);
  const program = await getExecutionProgramForClosure(
    Closure({
      expression: executeExpression,
      references: opahClosure.references,
    })
  );

  const opahHostDir = await downloadOpahHost("0.1.4");

  await buildExecutable(
    program,
    {
      "@opah/core": join(opahHostDir, "dist/core"),
      "@opah/host": join(opahHostDir, "dist/host"),
      "@opah/immutable": join(opahHostDir, "dist/immutable"),
    },
    {
      target,
      output: outputPath,
    }
  );
}

export function test() {
  runScenarios(opahSpec);
}
