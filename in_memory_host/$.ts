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
import { ChildProcess } from "child_process";
import { EventEmitter } from "events";
import {
  existsSync,
  readFileSync,
  unwatchFile,
  watchFile,
  writeFileSync,
} from "fs";
import {
  ClientRequest,
  IncomingMessage,
  RequestOptions,
  ServerResponse,
} from "http";
import { request } from "https";
import { PassThrough } from "stream";
import { URL } from "url";
import { Subject } from "../axax/subject.ts";
import { Hostname, isHostname } from "../http/Hostname.ts";
import { unsafeCast } from "../macros/unsafeCast.ts";
import { canonicalIdentifier } from "../opah/executeExpressionWithScope/getExecutionProgramForClosure/canonicalIdentifier.ts";
import { encode } from "../refine/encode.ts";
import { replacementTuple } from "./replacementTuple.ts";

const inMemoryStdout = new PassThrough();
const inMemoryStderr = new PassThrough();

export const inMemoryHost = Map([
  replacementTuple(logToConsole, (...args: any[]) => {
    inMemoryStdout.write(args.join(" ") + "\n");
  }),
  replacementTuple(stdout, unsafeCast<typeof stdout>(inMemoryStdout)),
  replacementTuple(stderr, unsafeCast<typeof stderr>(inMemoryStderr)),
  replacementTuple(writeFileSync, (path: string, contents: string) => {
    FilesystemState.filesystem = FilesystemState.filesystem.set(path, contents);

    FilesystemState.watchers.get(path)?.();
  }),
  replacementTuple(
    readFileSync,
    unsafeCast<typeof readFileSync>((path: string) => {
      return FilesystemState.filesystem.get(path);
    })
  ),
  replacementTuple(existsSync, (path: string) => {
    return FilesystemState.filesystem.has(path);
  }),
  replacementTuple(watchFile, (filename: string, cb: () => unknown) => {
    FilesystemState.watchers = FilesystemState.watchers.set(filename, cb);
  }),
  replacementTuple(unwatchFile, (filename: string, cb: () => unknown) => {
    FilesystemState.watchers = FilesystemState.watchers.delete(filename);
  }),
  replacementTuple(forkProgram, (executionProgram: Program, cwd: string) => {
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
    return unsafeCast<ChildProcess>({
      stdout,
      stderr,
      kill(signal: string) {
        eventEmitter.emit(signal);
      },
      on: eventEmitter.on.bind(eventEmitter),
    });
  }),
  replacementTuple(
    request,
    (
      options: string | URL | RequestOptions,
      cb?: RequestOptions | ((res: IncomingMessage) => void)
    ) => {
      const requestedURL = new URL(options as string);
      const listener = HTTPState.hostnameListeners.get(
        encode(isHostname, requestedURL.hostname)
      );

      if (!listener) {
        throw new Error("Unimplemented");
      }

      const serverSideRequest = (new PassThrough() as unknown) as IncomingMessage;
      const serverSideResponse = (new PassThrough() as unknown) as ServerResponse;

      listener.onNext({
        request: serverSideRequest,
        response: serverSideResponse,
      });

      const clientRequest = (new PassThrough() as unknown) as ClientRequest;

      setImmediate(() => {
        clientRequest.emit("response", serverSideResponse);
      });

      return clientRequest;
    }
  ),
]);

const FilesystemState = {
  filesystem: Map<string, string>(),
  watchers: Map<string, () => unknown>(),
};

export type HTTPServerParams = {
  request: IncomingMessage;
  response: ServerResponse;
};

const HTTPState = {
  hostnameListeners: Map<Hostname, Subject<HTTPServerParams>>(),
};

export function listenOnHostname(hostname: Hostname) {
  const subject = new Subject<HTTPServerParams>();
  HTTPState.hostnameListeners = HTTPState.hostnameListeners.set(
    hostname,
    subject
  );
  return subject.iterator;
}
