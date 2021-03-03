export type Refine<Type, Tokens extends { [key: string]: null }> = {
  readonly __opaque__: Tokens;
} & Type;

export type KeySet<T extends keyof { [key: string]: null }> = {
  [key in T]: null;
};
