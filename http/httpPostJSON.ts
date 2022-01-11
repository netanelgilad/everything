import { emptyReadable } from "../streams/emptyReadable.ts";
import { readStreamToString } from "../streams/readStreamToString.ts";
import { httpRequest } from "./httpRequest.ts";

export type SetOptional<BaseType, Keys extends keyof BaseType> =
		// Pick just the keys that are readonly from the base type.
		Omit<BaseType, Keys> &
		// Pick the keys that should be mutable from the base type and make them mutable.
		Partial<Pick<BaseType, Keys>>

export async function httpPostJSON(
  opts: SetOptional<Omit<Parameters<typeof httpRequest>[0], "method">, 'data'>
) {
  const response = await httpRequest({
    method: "POST",
    ...opts,
    data: opts.data ?? emptyReadable(),
    headers: {
      "User-Agent": "opah",
      ...opts.headers,
      Accept: "application/vnd.github.v3+jso",
    },
  });

  return JSON.parse(await readStreamToString(response));
}
