import { Readable } from "stream";
import { request, IncomingMessage, ClientRequest } from "http";

export type HostAndPathTarget = {
  host: string;
  path?: string;
  search?: string;
};

export type HTTPRequestBase = {
  method: "GET" | "DELETE" | "POST" | "PUT" | "PATCH";
  headers?: {
    [name: string]: string;
  };
  target:
    | {
        socketPath: string;
        path: string;
      }
    | {
        url: string;
      }
    | HostAndPathTarget;
};

export async function httpRequest(
  props: HTTPRequestBase & {
    data: Readable;
    requestFn?: typeof request;
  }
) {
  props.requestFn = props.requestFn ?? request;

  let clientRequest: ClientRequest;
  if ("socketPath" in props.target) {
    clientRequest = props.requestFn({
      path: props.target.path,
      method: props.method,
      socketPath: props.target.socketPath,
      headers: props.headers,
    });
  } else if ("url" in props.target) {
    clientRequest = props.requestFn(props.target.url, {
      method: props.method,
      headers: props.headers,
    });
  } else if ("host" in props.target) {
    clientRequest = props.requestFn({
      host: props.target.host,
      path:
        props.target.path &&
        props.target.path +
          (props.target.search ? `?${props.target.search}` : ""),
      method: props.method,
      headers: props.headers,
    });
  }

  return new Promise<IncomingMessage>((resolve, reject) => {
    clientRequest.on("response", resolve);
    clientRequest.on("error", reject);
    props.data.pipe(clientRequest);
  });
}
