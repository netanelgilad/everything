import { readFileSync } from "fs";
import { request } from "https";
import { httpRequest } from "../http/httpRequest.ts";
import { URLString } from "../http/HttpTarget.ts";
import { build } from "../opah/dev.ts";
import { stringToReadable } from "../streams/stringToReadable.ts";
import { readStreamToString } from "../streams/readStreamToString.ts";

export default async function (githubToken: string) {
  const commitHash = process.env.GITHUB_SHA;
  const eventPayload = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH!, "utf8")
  );

  const {
    repository: {
      owner: { name: repoOwner },
      name: repoName,
    },
  } = eventPayload;

  await build("node14-linux");

  const response = await httpRequest({
    method: "POST",
    requestFn: request,
    target: {
      url: `https://api.github.com/repos/${repoOwner}/${repoName}/releases` as URLString,
    },
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${githubToken}`,
      "User-Agent": repoOwner,
    },
    data: stringToReadable(
      JSON.stringify({
        tag_name: `release-${commitHash?.substr(0, 7)}`,
        target_commitish: commitHash,
        prerelease: true,
      })
    ),
  });

  if (response.statusCode === 201) {
    console.log("Release created successfully");
  } else {
    throw new Error(
      `Failed to create release: ${
        response.statusCode
      } ${await readStreamToString(response)}`
    );
  }
}
