import { ExpressionStatement, getASTFromCode } from "@depno/core";
import { logToConsole } from "@depno/host";
import { Map } from "@depno/immutable";
import { join } from "path";
import { createInterface } from "readline";
import { Readable, Writable } from "stream";
import { executeExpressionWithScope } from "../depno/executeExpressionWithScope/$.ts";

export async function open(
  stdin: Readable,
  stdout: Writable,
  stderr: Writable,
  cwd: string
) {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  rl.on("SIGINT", () => {
    logToConsole();
    // @ts-expect-error
    rl.line = "";
    rl.prompt();
  });

  rl.setPrompt("$ ");
  rl.prompt();
  rl.on("line", async (line) => {
    const input = line.trim();

    if (input === "exit") {
      rl.close();
      return;
    } else if (input !== "") {
      try {
        await handleCommand(input, cwd, stdout, stderr);
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
  const childProcess = await executeExpressionWithScope(
    commandExpression,
    currentScopePath,
    cwd
  );
  childProcess.stdout!.pipe(stdout);
  childProcess.stderr!.pipe(stderr);
  return new Promise((resolve) => {
    childProcess.on("exit", resolve);
  });
}
