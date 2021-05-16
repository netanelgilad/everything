import { request } from "https";
import { httpRequest } from "../http/httpRequest.ts";
import { URLString } from "../http/HttpTarget.ts";
import { stringToReadable } from "../streams/stringToReadable.ts";

export type RepoIdentifier = {
  owner: string;
  name: string;
};

export async function createRelease(opts: {
  repoIdentifier: RepoIdentifier;
  githubToken: string;
  tagName: string;
  targetCommitish: string;
  prerelease: boolean;
}) {
  const response = await httpRequest({
    method: "POST",
    requestFn: request,
    target: {
      url: `https://api.github.com/repos/${opts.repoIdentifier.owner}/${opts.repoIdentifier.name}/releases` as URLString,
    },
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${opts.githubToken}`,
      "User-Agent": opts.repoIdentifier.owner,
    },
    data: stringToReadable(
      JSON.stringify({
        tag_name: opts.tagName,
        target_commitish: opts.targetCommitish,
        prerelease: opts.prerelease,
      })
    ),
  });
}
