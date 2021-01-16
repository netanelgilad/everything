import { Closure } from "@opah/core";

export type Scenario = {
  description: string;
  focus?: true;
  verify: Closure<() => Promise<unknown>>;
};
export const scenario = (x: Scenario) => x;
