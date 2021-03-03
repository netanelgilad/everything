import { KeySet, Refine } from "./refine.ts";

export function encode<Type, Knowledge extends KeySet<any>>(
  validator: (val: Type) => val is Refine<Type, Knowledge>,
  val: Type
): Refine<Type, Knowledge> {
  return val as Refine<Type, Knowledge>;
}
