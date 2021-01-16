import { focusedScenariosScenarios } from "./focused_scenarios.ts";
import { watchModeScenarios } from "./watch_mode.ts";

export const validatorSpec = [
  ...watchModeScenarios,
  ...focusedScenariosScenarios,
];
