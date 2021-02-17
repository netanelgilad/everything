/**
 *
 * @param items The list to remove from
 * @param toRemove The list of items to remove
 * @returns The items list without the items in toRemove list
 */
export function without<T>(items: T[], toRemove: T[]): T[] {
  return items.filter((x) => !toRemove.includes(x));
}
