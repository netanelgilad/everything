/**
 * Inverse a function.
 * @param fn The function to inverse
 * @returns A function that returns the reverse result of the original function
 */
export function not<T extends (...args: any[]) => boolean | Promise<boolean>>(
  fn: T
): (...args: Parameters<T>) => Promise<boolean> {
  return async (...args: Parameters<T>) => {
    return !(await fn(...args));
  };
}
