import {
  arrowFunctionExpression,
  blockStatement,
  CanonicalName,
  expressionStatement,
  identifier,
  Identifier,
  ImportSpecifier,
  isImportDeclaration,
  objectPattern,
  objectProperty,
  Program,
  program,
  variableDeclaration,
  variableDeclarator,
} from "@opah/core";
import {
  executeProgram,
  forkProgram,
  logToConsole,
  stderr,
  stdout,
} from "@opah/host";
import { Map } from "@opah/immutable";
import { EventEmitter } from "events";
import {
  existsSync,
  readFileSync,
  unwatchFile,
  watchFile,
  writeFileSync,
} from "fs";
import { PassThrough } from "stream";
import { canonicalIdentifier } from "../opah/executeExpressionWithScope/getExecutionProgramForClosure/canonicalIdentifier.ts";
import { canonicalName } from "../macros/canonicalName.ts";
import { definition } from "../macros/definition.ts";

const inMemoryStdout = new PassThrough();
const inMemoryStderr = new PassThrough();

export const inMemoryHost = Map([
  [
    canonicalName(logToConsole),
    definition((...args: any[]) => {
      inMemoryStdout.write(args.join(" ") + "\n");
    }),
  ],
  [canonicalName(stdout), definition(inMemoryStdout)],
  [canonicalName(stderr), definition(inMemoryStderr)],
  [
    canonicalName(writeFileSync),
    definition((path: string, contents: string) => {
      FilesystemState.filesystem = FilesystemState.filesystem.set(
        path,
        contents
      );

      FilesystemState.watchers.get(path)?.();
    }),
  ],
  [
    canonicalName(readFileSync),
    definition((path: string) => {
      return FilesystemState.filesystem.get(path);
    }),
  ],
  [
    canonicalName(existsSync),
    definition((path: string) => {
      return FilesystemState.filesystem.has(path);
    }),
  ],
  [
    canonicalName(watchFile),
    definition((filename: string, cb: () => unknown) => {
      FilesystemState.watchers = FilesystemState.watchers.set(filename, cb);
    }),
  ],
  [
    canonicalName(unwatchFile),
    definition((filename: string, cb: () => unknown) => {
      FilesystemState.watchers = FilesystemState.watchers.delete(filename);
    }),
  ],
  [
    canonicalName(forkProgram),
    definition((executionProgram: Program, cwd: string) => {
      const replcaedStatements = executionProgram.body.map((statement) => {
        if (
          isImportDeclaration(statement) &&
          statement.source.value === "@opah/host"
        ) {
          return variableDeclaration("const", [
            variableDeclarator(
              objectPattern(
                statement.specifiers.map((specifier) =>
                  objectProperty(
                    identifier(
                      canonicalIdentifier(
                        CanonicalName({
                          uri: "@opah/host",
                          name: ((specifier as ImportSpecifier)
                            .imported as Identifier).name,
                        })
                      )
                    ),
                    identifier(
                      canonicalIdentifier(
                        CanonicalName({
                          uri: "@opah/host",
                          name: ((specifier as ImportSpecifier)
                            .imported as Identifier).name,
                        })
                      )
                    ),
                    false,
                    true
                  )
                )
              ),
              identifier("deps")
            ),
          ]);
        }
        return statement;
      });
      const replacePrgoram = program(
        [
          expressionStatement(
            arrowFunctionExpression(
              [identifier("deps")],
              blockStatement(replcaedStatements)
            )
          ),
        ],
        undefined,
        "module"
      );
      const stdout = new PassThrough();
      const stderr = new PassThrough();
      const toExecute = executeProgram(replacePrgoram);
      const promise = Promise.resolve(
        toExecute({
          [canonicalIdentifier(
            CanonicalName({
              uri: "@opah/host",
              name: "logToConsole",
            })
          )]: (data: string) => {
            stdout.push(data);
          },
          [canonicalIdentifier(
            CanonicalName({
              uri: "@opah/host",
              name: "stdout",
            })
          )]: stdout,
          [canonicalIdentifier(
            CanonicalName({
              uri: "@opah/host",
              name: "stderr",
            })
          )]: stderr,
        })
      );
      const eventEmitter = new EventEmitter();
      promise.then(() => {
        stdout.end();
        stderr.end();
        eventEmitter.emit("exit");
      });
      return {
        stdout,
        stderr,
        kill(signal: string) {
          eventEmitter.emit(signal);
        },
        on: eventEmitter.on.bind(eventEmitter),
      };
    }),
  ],
]);

const FilesystemState = {
  filesystem: Map<string, string>(),
  watchers: Map<string, () => unknown>(),
};
