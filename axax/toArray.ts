/**
 * Count the number of items in an async interable
 */
export async function toArray<T>(source: AsyncIterable<T>): Promise<T[]> {
  let all: T[] = [];
  for await (const item of source) {
    all.push(item);
  }
  return all;
}
