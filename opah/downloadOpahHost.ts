import { createWriteStream, mkdir, realpathSync } from "fs";
import { request } from "https";
import { tmpdir } from "os";
import { join } from "path";
import { createGunzip } from "zlib";
import { httpRequest } from "../http/httpRequest.ts";
import { URLString } from "../http/HttpTarget.ts";
import { cryotoRandomString } from "../random/cryptoRandomString.ts";
import { emptyReadable } from "../streams/emptyReadable.ts";
import { extract } from "../tar/extract.ts";

export async function downloadOpahHost(version: string) {
  const theTarStream = await httpRequest({
    target: {
      url: `https://registry.npmjs.org/opah-host/-/opah-host-${version}.tgz` as URLString,
    },
    method: "GET",
    data: emptyReadable(),
    requestFn: request,
  });
  const osTempDir = realpathSync(tmpdir());
  const tempDir = join(osTempDir, cryotoRandomString(32));
  await new Promise((resolve) => mkdir(join(tempDir), resolve));
  const extractIterator = extract(theTarStream.pipe(createGunzip()));
  // The first entry is the package folder, and we don't care about it
  await extractIterator.next();
  for await (const { entry, stream } of extractIterator) {
    if (entry.type === "directory") {
      await new Promise((resolve) =>
        mkdir(join(tempDir, entry.name.slice("package".length)), resolve)
      );
    } else {
      stream.pipe(
        createWriteStream(join(tempDir, entry.name.slice("package".length)))
      );
    }
  }
  return tempDir;
}
