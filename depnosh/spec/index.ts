import { builtinCommandsScenarios } from "./builtin_commands.ts";
import { scenarios } from "./execute_functions.ts";

export const depnoshSpec = [...scenarios, ...builtinCommandsScenarios];
