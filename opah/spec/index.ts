import { Spec_watchCanonicalName } from "../watchCanonicalName.ts";
import { importsScenarios } from "./imports.ts";
import { reexportScenarios } from "./reexports.ts";
import { runningFilesScenarios } from "./running_files.ts";

export const opahSpec = [
  ...importsScenarios,
  ...Spec_watchCanonicalName,
  ...runningFilesScenarios,
  ...reexportScenarios,
];
