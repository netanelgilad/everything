import { Closure, createMacro } from "@opah/core";
import { URL } from "url";
import { KeySet, Refine } from "../refine/Refine.ts";

export type HostAndPathTarget = {
  host: string;
  path?: string;
  search?: string;
};

export type SocketAndPathTarget = {
  socketPath: string;
  path: string;
};

export type URLString = Refine<string, KeySet<"URL">>;
export const isURL = (x: string): x is URLString => true;

export type URLTarget = {
  url: URL | URLString;
};

export type HTTPTarget = HostAndPathTarget | SocketAndPathTarget | URLTarget;

export const asURL = createMacro<[url: string], URLString>(async (urlClosure) => {
  return urlClosure as Closure<URLString>;
})