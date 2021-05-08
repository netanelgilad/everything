import { Map } from "@opah/immutable";
import { readFileSync } from "fs";
import { someString } from "../../abstracts/someString.ts";
import { assertThat } from "../../assertions/assertThat.ts";
import { is } from "../../assertions/is.ts";
import { concurrentMap } from "../../axax/concurrentMap.ts";
import { getBody } from "../../http/getBody.ts";
import { Hostname } from "../../http/Hostname.ts";
import { isURL } from "../../http/HttpTarget.ts";
import { HTTPServerParams, listenOnHostname } from "../../in_memory_host/$.ts";
import { closure } from "../../macros/closure.ts";
import { encode } from "../../refine/encode.ts";
import { runScenarios } from "../../validator/runScenarios.ts";
import { scenario } from "../../validator/scenario.ts";

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
        : await getBody({ target: { url: encode(isURL, uri) } });

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

export function test() {
  runScenarios([
    scenario({
      description: "should get contents from an https url",
      verify: closure(async () => {
        const aString = someString();
        const requestsIterator = listenOnHostname("example.com" as Hostname);
        concurrentMap<HTTPServerParams, void>(async ({ request, response }) => {
          const path = request.url;
          response.write(aString);
          response.end();
        }, Infinity)(requestsIterator);

        const [, contents] = await getContentsFromURI(
          Map(),
          "https://example.com/some-path"
        );
        await assertThat(contents, is(aString));
      }),
    }),
  ]);
}
