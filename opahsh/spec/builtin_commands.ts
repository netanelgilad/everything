import { strict as assert } from "assert";
import { EventEmitter } from "events";
import { PassThrough } from "stream";
import { someDirectory } from "../../abstracts/someDirectory.ts";
import { assertion } from "../../assertions/Assertion.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { not } from "../../assertions/not.ts";
import { willStream } from "../../assertions/willStream.ts";
import { closure } from "../../macros/closure.ts";
import { scenario } from "../../validator/scenario.ts";
import { open } from "../open.ts";

export const builtinCommandsScenarios = [
  scenario({
    description: "should close the shell when the command is exit",
    verify: closure(async () => {
      const directory = someDirectory();
      const stdin = new PassThrough();
      const stdout = new PassThrough();
      const stdinBeforeOpenEventsListernsCount = getEventsListernsCount(stdin);
      open(stdin, stdout, new PassThrough(), directory);
      await assertThat(
        stdin,
        not(hasEventsListernsCount(stdinBeforeOpenEventsListernsCount))
      );
      await assertThat(stdout, willStream("$ "));
      stdin.write("exit\n");
      await assertThat(
        stdin,
        hasEventsListernsCount(stdinBeforeOpenEventsListernsCount)
      );
    }),
  }),
];

function getEventsListernsCount(emitter: EventEmitter) {
  const eventsListenedOn = emitter.eventNames();
  return Object.fromEntries(
    eventsListenedOn.map((x) => [x, emitter.listenerCount(x)])
  );
}

const hasEventsListernsCount = (expected: { [name: string]: number }) =>
  assertion((emitter: EventEmitter) =>
    assert.deepStrictEqual(getEventsListernsCount(emitter), expected)
  );
