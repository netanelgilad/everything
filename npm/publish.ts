import { createHash } from "crypto";
import { request } from "https";
import { Readable } from "stream";
import { httpRequest } from "../http/httpRequest.ts";
import { URLString } from "../http/HttpTarget.ts";
import { readStreamToBuffer } from "../streams/readStreamToBuffer.ts";
import { stringToReadable } from "../streams/stringToReadable.ts";

export async function publish(opts: {
  name: string;
  version: string;
  tarball: Readable;
  authToken: string;
}) {
  const tarballBuffer = await readStreamToBuffer(opts.tarball);

  const body = {
    _id: opts.name,
    name: opts.name,
    access: "public",
    "dist-tags": {
      latest: opts.version,
    },
    versions: {
      [opts.version]: {
        name: opts.name,
        version: opts.version,
        dist: {
          tarball: `http://registry.npmjs.org/${opts.name}/-/${opts.name}-${opts.version}.tgz`,
          shasum: createHash("sha1").update(tarballBuffer).digest("hex"),
        },
      },
    },
    _attachments: {
      [`${opts.name}-${opts.version}.tgz`]: {
        "content-type": "application/octet-stream",
        data: tarballBuffer.toString("base64"),
        length: tarballBuffer.length,
      },
    },
  };

  const response = await httpRequest({
    target: {
      url: `https://registry.npmjs.org/${opts.name}` as URLString,
    },
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${opts.authToken}`,
    },
    requestFn: request,
    data: stringToReadable(JSON.stringify(body)),
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `Failed to publish package. Response status code: ${response.statusCode}`
    );
  }
}
