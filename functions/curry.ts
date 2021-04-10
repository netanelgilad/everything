/**
 * Curry a function by binding it's first argument.
 * @param fn The function to curry
 * @param arg The argument to bind
 * @returns A function where the first argument is bound to the value of `arg`
 */
export function curry<P, T extends (arg0: P, ...rest: any[]) => any>(
  fn: T,
  arg: P
): T extends (arg0: infer U, ...rest: infer P) => infer R
  ? (...rest: P) => R
  : never {
  return ((...args: any) => fn(arg, ...args)) as any;
}
