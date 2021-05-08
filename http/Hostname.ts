import { KeySet, Refine } from "../refine/refine.ts";

export type Hostname = Refine<string, KeySet<"Hostname">>;
export const isHostname = (x: string): x is Hostname => x.includes(".");
