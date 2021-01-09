import { Closure } from "@opah/core";

export type Scenario = {
  description: string;
  verify: Closure<() => Promise<unknown>>;
};
export const scenario = (x: Scenario) => x;
