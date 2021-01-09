import { readFileSync } from "fs";
import { IncomingMessage } from "http";
import { get } from "https";
import { Map } from "@opah/immutable";

export type URIStore = Map<string, string>;

export async function getContentsFromURI(
  uriStore: URIStore,
  uri: string
): Promise<[URIStore, string]> {
  const existing = uriStore.get(uri);
  if (!existing) {
    try {
      const contents = uri.startsWith("/")
        ? readFileSync(uri, "utf8")
        : await getContentsFromURL(uri);

      return [uriStore.set(uri, contents), contents];
    } catch (err) {
      throw new Error(
        `Failed to get contents from uri: ${uri}: ${err.message}`
      );
    }
  } else {
    return [uriStore, existing];
  }
}

async function getContentsFromURL(url: string) {
  const response = await new Promise<IncomingMessage>((resolve) =>
    get(url, resolve)
  );
  return new Promise<string>((resolve) => {
    response.setEncoding("utf8");
    let rawData = "";
    response.on("data", (chunk) => {
      rawData += chunk;
    });
    response.on("end", () => {
      resolve(rawData);
    });
  });
}
