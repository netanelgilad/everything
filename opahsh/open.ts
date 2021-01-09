import { Closure, ExpressionStatement, getASTFromCode } from "@opah/core";
import { forkProgram, logToConsole } from "@opah/host";
import { Map } from "@opah/immutable";
import { ChildProcess } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import { Readable, Writable } from "stream";
import { executeExpressionWithScope } from "../opah/executeExpressionWithScope/$.ts";
import { getExecutionProgramForClosure } from "../opah/executeExpressionWithScope/getExecutionProgramForClosure/$.ts";

export async function open(
  stdin: Readable,
  stdout: Writable,
  stderr: Writable,
  cwd: string
) {
  let currentRunningProcess: ChildProcess;

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  const sigintListener = () => {
    if (currentRunningProcess) {
      currentRunningProcess.kill("SIGINT");
    }
    logToConsole();
    // @ts-expect-error
    rl.line = "";
    rl.prompt();
  };

  rl.on("SIGINT", sigintListener);
  process.on("SIGINT", sigintListener);

  rl.setPrompt("$ ");
  rl.prompt();
  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === "exit") {
      rl.close();
      return;
    } else if (input !== "") {
      try {
        currentRunningProcess = await handleCommand(input, cwd, stdout, stderr);
        await new Promise((resolve) => {
          currentRunningProcess.on("exit", resolve);
        });
      } catch {}
    }
    rl.prompt();
  });
}

export async function handleCommand(
  command: string,
  cwd: string,
  stdout: Writable,
  stderr: Writable
) {
  const currentScopePath = join(cwd, "index.ts");
  const commandExpression = ((
    await getASTFromCode(Map(), command, currentScopePath)
  )[1].program.body[0] as ExpressionStatement).expression;

  let childProcess: ChildProcess;
  if (existsSync(currentScopePath)) {
    childProcess = await executeExpressionWithScope(
      commandExpression,
      currentScopePath,
      cwd
    );
  } else {
    const executionProgram = await getExecutionProgramForClosure(
      Closure({
        expression: commandExpression,
        references: Map(),
      })
    );
    childProcess = forkProgram(executionProgram, cwd, true);
  }
  childProcess.stdout!.pipe(stdout);
  childProcess.stderr!.pipe(stderr);
  return childProcess;
}
