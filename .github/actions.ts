import { readFileSync } from "fs";
import {
  FilePathString,
  FolderPathString,
  join,
  RelativePathString,
} from "../filesystem/PathString.ts";
import { build } from "../opah/dev.ts";
import { cryotoRandomString } from "../random/cryptoRandomString.ts";
import { tmpdir } from "../os/tmpdir.ts";
import { createTarFromFolder } from "../tar/createTarFromFolder.ts";
import { publish } from "../npm/publish.ts";
import { createGzip } from "zlib";

export default async function (npmAccessToken: string) {
  const commitHash = process.env.GITHUB_SHA;

  const packageDir = join(
    tmpdir(),
    cryotoRandomString(32) as RelativePathString
  ) as FolderPathString;

  await build(
    "node14-linux",
    join(packageDir, "opah" as RelativePathString) as FilePathString
  );

  const packageTarball = (await createTarFromFolder(packageDir)).pipe(
    createGzip()
  );

  await publish({
    name: "opah",
    version: `0.0.0-${commitHash}`,
    tarball: packageTarball,
    authToken: npmAccessToken,
  });
}
