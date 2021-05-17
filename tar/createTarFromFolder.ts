import { PassThrough, Readable } from "stream";
import { Buffer } from "buffer";
import { encodeHeader } from "./encodeHeader.ts";
import { constants } from "fs";
import {
  FilePathString,
  FolderPathString,
  join,
  PathString,
  RelativePathString,
} from "../filesystem/PathString.ts";
import { readdir } from "../filesystem/readdir.ts";
import { fromArray } from "../axax/fromArray.ts";
import { map } from "../axax/map.ts";
import { reduce } from "../axax/reduce.ts";
import { concurrentFilter } from "../axax/concurrentFilter.ts";
import { isFile } from "../filesystem/isFile.ts";
import { readFile } from "../filesystem/readFile.ts";
import { basename } from "path";
import { lstat } from "../filesystem/lstat.ts";

const END_OF_TAR = Buffer.alloc(1024);
const DMODE = parseInt("755", 8);
const FMODE = parseInt("644", 8);

function overflow(readable: Readable, size: number) {
  size &= 511;
  if (size) readable.push(END_OF_TAR.slice(0, 512 - size));
}

function modeToType(mode?: number) {
  switch (mode! & constants.S_IFMT) {
    case constants.S_IFBLK:
      return "block-device";
    case constants.S_IFCHR:
      return "character-device";
    case constants.S_IFDIR:
      return "directory";
    case constants.S_IFIFO:
      return "fifo";
    case constants.S_IFLNK:
      return "symlink";
  }

  return "file";
}

async function addFileToTarGZStream(stream: Readable, file: FilePathString) {
  const type = modeToType(undefined);
  const buffer = await readFile(file);
  const stats = await lstat(file);
  stream.push(
    encodeHeader({
      name: `package/${basename(file)}`,
      size: buffer.length,
      type,
      mode: stats.mode,
      uid: 0,
      gid: 0,
      mtime: new Date(),
    })
  );
  stream.push(buffer);
  overflow(stream, buffer.length);
  return stream;
}

export async function createTarFromFolder(
  folder: FolderPathString
): Promise<Readable> {
  const entriesInFolder = fromArray(await readdir(folder));
  const filesInFolder = concurrentFilter<PathString>((entry) => isFile(entry))(
    map<RelativePathString, PathString>((entry) => join(folder, entry))(
      entriesInFolder
    )
  ) as AsyncIterableIterator<FilePathString>;

  const tarStream = new PassThrough();
  tarStream.push(
    encodeHeader({
      name: "package",
      size: 0,
      type: "directory",
      mode: DMODE,
      uid: 0,
      gid: 0,
      mtime: new Date(),
    })
  );
  const stream = await reduce(addFileToTarGZStream, tarStream)(filesInFolder);
  stream.push(END_OF_TAR);
  stream.push(null);
  return stream;
}
