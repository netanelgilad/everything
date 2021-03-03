import { KeySet, Refine } from "./refine.ts";

export function ensure<Type, Knowledge extends KeySet<any>>(
  validator: (val: Type) => val is Refine<Type, Knowledge>,
  val: Type
): asserts val is Refine<Type, Knowledge> {}
