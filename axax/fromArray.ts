export async function* fromArray<T>(values: T[]) {
  for (const item of values) {
    yield item;
  }
}
