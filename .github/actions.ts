import { createGzip } from "zlib";
import {
  FilePathString,
  FolderPathString,
  join,
  RelativePathString,
} from "../filesystem/PathString.ts";
import { writeFile } from "../filesystem/writeFile.ts";
import { publish } from "../npm/publish.ts";
import { build } from "../opah/dev.ts";
import { tmpdir } from "../os/tmpdir.ts";
import { cryotoRandomString } from "../random/cryptoRandomString.ts";
import { createTarFromFolder } from "../tar/createTarFromFolder.ts";

const PACKAGE_NAME = "opah";

export default async function (npmAccessToken: string) {
  const commitHash = process.env.GITHUB_SHA;

  const packageVersion = `0.0.0-${commitHash}`;

  const packageDir = join(
    tmpdir(),
    cryotoRandomString(32) as RelativePathString
  ) as FolderPathString;

  await build(
    "node14-macos",
    join(packageDir, PACKAGE_NAME as RelativePathString) as FilePathString
  );

  await writeFile(
    join(packageDir, "package.json" as FilePathString),
    JSON.stringify({
      name: PACKAGE_NAME,
      version: packageVersion,
      bin: `./${PACKAGE_NAME}`,
    })
  );

  const packageTarball = (await createTarFromFolder(packageDir)).pipe(
    createGzip()
  );

  await publish({
    name: PACKAGE_NAME,
    version: packageVersion,
    tarball: packageTarball,
    authToken: npmAccessToken,
  });
}
