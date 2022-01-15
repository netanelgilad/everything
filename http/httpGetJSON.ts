import { parseJSON } from "@opah/host";
import { emptyReadable } from "../streams/emptyReadable.ts";
import { readStreamToString } from "../streams/readStreamToString.ts";
import { httpRequest } from "./httpRequest.ts";

export async function httpGetJSON(
  opts: Omit<Parameters<typeof httpRequest>[0], "data" | "method">
) {
  const response = await httpRequest({
    method: "GET",
    data: emptyReadable(),
    ...opts,
    headers: {
      "User-Agent": "opah",
      ...opts.headers,
      Accept: "application/vnd.github.v3+jso",
    },
  });

  return parseJSON(await readStreamToString(response));
}
