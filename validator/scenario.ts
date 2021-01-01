import { Closure } from "@depno/core";

export type Scenario = {
  description: string;
  verify: Closure<() => Promise<unknown>>;
};
export const scenario = (x: Scenario) => x;
