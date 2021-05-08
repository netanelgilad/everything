import { HTTPTarget } from "./HttpTarget.ts";
import { httpRequest } from "./httpRequest.ts";
import { emptyReadable } from "../streams/emptyReadable.ts";
import { readStreamToString } from "../streams/readStreamToString.ts";
import { request } from "https";

export async function getBody(props: { target: HTTPTarget }) {
  const response = await httpRequest({
    method: "GET",
    target: props.target,
    data: emptyReadable(),
    requestFn: request,
  });

  return readStreamToString(response);
}
