import { createGzip } from "zlib";
import {
  FilePathString,
  FolderPathString,
  join,
  RelativePathString,
} from "../filesystem/PathString.ts";
import { readFile } from "../filesystem/readFile.ts";
import { writeFile } from "../filesystem/writeFile.ts";
import { getNameOfRef } from "../git/getNameOfRef.ts";
import { publish } from "../npm/publish.ts";
import { build } from "../opah/dev.ts";
import { tmpdir } from "../os/tmpdir.ts";
import { cryotoRandomString } from "../random/cryptoRandomString.ts";
import { createTarFromFolder } from "../tar/createTarFromFolder.ts";

const PACKAGE_NAME = "opah";

export default async function (npmAccessToken: string) {
  const commitHash = process.env.GITHUB_SHA;
  const eventPayload = JSON.parse(
    await readFile(process.env.GITHUB_EVENT_PATH! as FilePathString, "utf8")
  );

  const packageVersion = `0.0.0-${commitHash}`;

  const packageDir = join(
    tmpdir(),
    cryotoRandomString(32) as RelativePathString
  ) as FolderPathString;

  const buildTarget = "node14-linux"

  await build(
    buildTarget,
    join(
      packageDir,
      `${PACKAGE_NAME}-${buildTarget}` as RelativePathString
    ) as FilePathString
  );

  await writeFile(
    join(packageDir, PACKAGE_NAME as FilePathString),
    `#!/usr/bin/env node
    require("child_process").execFileSync(require('path').join(__dirname, '${PACKAGE_NAME}-${buildTarget}'), process.argv.slice(2), { stdio: "inherit" });`,
    {
      mode: 0x544
    }
  );

  await writeFile(
    join(packageDir, "package.json" as FilePathString),
    JSON.stringify({
      name: PACKAGE_NAME,
      version: packageVersion,
      bin: { [PACKAGE_NAME]: `./${PACKAGE_NAME}` },
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
    distTags: [getNameOfRef(eventPayload.ref)],
  });
}
