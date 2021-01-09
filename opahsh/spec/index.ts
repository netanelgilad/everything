import { builtinCommandsScenarios } from "./builtin_commands.ts";
import {
  executeFunctionsE2EScenarios,
  executeFunctionsInMemoryScenarios,
} from "./execute_functions.ts";

export const opahshSpec = {
  inMemory: [...executeFunctionsInMemoryScenarios, ...builtinCommandsScenarios],
  e2e: [...executeFunctionsE2EScenarios],
};
