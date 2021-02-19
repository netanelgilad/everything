import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * Memoize a function over the filesystem.
 * @param identifier A unique identifier for this cache (an identifier for the function that is cached)
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoizeInFS<T extends (...args: any[]) => any>(
  identifier: string,
  fn: T
): (
  ...args: Parameters<T>
) => Promise<ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>> {
  const inProgress: {
    [hash: string]: Promise<
      ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>
    >;
  } = {};
  return (...args: Parameters<T>) => {
    const hash =
      identifier +
      "_" +
      args
        .map((x) => x.toString())
        .join("_")
        .replace(/\//g, "_");
    if (!inProgress[hash]) {
      inProgress[hash] = new Promise(async (resolve) => {
        if (existsSync(`./cache/${hash}`)) {
          resolve(
            JSON.parse(readFileSync(`./cache/${hash}`, "utf8"))
          ) as ReturnType<T>;
        } else {
          const result = await fn(...args);
          delete inProgress[hash];
          writeFileSync(`./cache/${hash}`, JSON.stringify(result));
          resolve(result as ReturnType<T>);
        }
      }) as ReturnType<T>;
    }

    return inProgress[hash];
  };
}
