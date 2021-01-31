import {
  arrayExpression,
  CanonicalName,
  Closure,
  createMacro,
} from "@opah/core";
import { Map } from "@opah/immutable";

export const tuple = createMacro((...args: Closure[]) => {
  return Closure({
    expression: arrayExpression(args.map((x) => x.expression)),
    references: args.reduce(
      (result, arg) => result.merge(arg.references),
      Map<string, CanonicalName>()
    ),
  });
}) as <T extends any[]>(...args: T) => T;
