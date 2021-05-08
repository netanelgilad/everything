import { Buffer } from "buffer";

export function decodeHeader(buffer: Buffer) {
  let typeflag = buffer[156] === 0 ? 0 : buffer[156] - ZERO_OFFSET;
  let name = decodeStr(buffer, 0, 100);
  const mode = decodeOct(buffer, 100, 8);
  const uid = decodeOct(buffer, 108, 8);
  const gid = decodeOct(buffer, 116, 8);
  const size = decodeOct(buffer, 124, 12);
  const mtime = decodeOct(buffer, 136, 12);
  const type = toType(typeflag);
  const linkname = buffer[157] === 0 ? null : decodeStr(buffer, 157, 100);
  const uname = decodeStr(buffer, 265, 32);
  const gname = decodeStr(buffer, 297, 32);
  const devmajor = decodeOct(buffer, 329, 8);
  const devminor = decodeOct(buffer, 337, 8);

  const c = cksum(buffer);

  if (c === 8 * 32) return null;
  if (c !== decodeOct(buffer, 148, 8))
    throw new Error(
      `Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped? (header buffer: ${buffer.toString()})`
    );

  if (USTAR_MAGIC.compare(buffer, MAGIC_OFFSET, MAGIC_OFFSET + 6) === 0) {
    // ustar (posix) format.
    // prepend prefix, if present.
    if (buffer[345]) name = decodeStr(buffer, 345, 155) + "/" + name;
  } else if (
    GNU_MAGIC.compare(buffer, MAGIC_OFFSET, MAGIC_OFFSET + 6) === 0 &&
    GNU_VER.compare(buffer, VERSION_OFFSET, VERSION_OFFSET + 2) === 0
  ) {
    // 'gnu'/'oldgnu' format. Similar to ustar, but has support for incremental and
    // multi-volume tarballs.
  } else {
    throw new Error("Invalid tar header: unknown format.");
  }

  // to support old tar versions that use trailing / to indicate dirs
  if (typeflag === 0 && name && name[name.length - 1] === "/") typeflag = 5;

  return {
    name,
    mode,
    uid,
    gid,
    size,
    mtime: new Date(1000 * mtime!),
    type: type,
    linkname,
    uname,
    gname,
    devmajor,
    devminor,
  };
}

const decodeStr = (
  buffer: Buffer,
  offset: number,
  length: number,
  encoding?: string
) => {
  return buffer
    .slice(offset, indexOf(buffer, 0, offset, offset + length))
    .toString(encoding);
};

const indexOf = (buffer: Buffer, num: number, offset: number, end: number) => {
  for (; offset < end; offset++) {
    if (buffer[offset] === num) return offset;
  }
  return end;
};

const decodeOct = (buffer: Buffer, offset: number, length: number) => {
  buffer = buffer.slice(offset, offset + length);
  offset = 0;

  // If prefixed with 0x80 then parse as a base-256 integer
  if (buffer[offset] & 0x80) {
    return parse256(buffer);
  } else {
    // Older versions of tar can prefix with spaces
    while (offset < buffer.length && buffer[offset] === 32) offset++;
    var end = clamp(indexOf(buffer, 32, offset, buffer.length), buffer.length);
    while (offset < end && buffer[offset] === 0) offset++;
    if (end === offset) return 0;
    return parseInt(buffer.slice(offset, end).toString(), 8);
  }
};

function parse256(buf: Buffer) {
  // first byte MUST be either 80 or FF
  // 80 for positive, FF for 2's comp
  let positive;
  if (buf[0] === 0x80) positive = true;
  else if (buf[0] === 0xff) positive = false;
  else return null;

  // build up a base-256 tuple from the least sig to the highest
  const tuple = [];
  for (var i = buf.length - 1; i > 0; i--) {
    var byte = buf[i];
    if (positive) tuple.push(byte);
    else tuple.push(0xff - byte);
  }

  let sum = 0;
  for (i = 0; i < tuple.length; i++) {
    sum += tuple[i] * Math.pow(256, i);
  }

  return positive ? sum : -1 * sum;
}

function clamp(index: number, len: number) {
  index = ~~index; // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

function toType(flag: number) {
  switch (flag) {
    case 0:
      return "file";
    case 1:
      return "link";
    case 2:
      return "symlink";
    case 3:
      return "character-device";
    case 4:
      return "block-device";
    case 5:
      return "directory";
    case 6:
      return "fifo";
    case 7:
      return "contiguous-file";
    case 72:
      return "pax-header";
    case 55:
      return "pax-global-header";
    case 27:
      return "gnu-long-link-path";
    case 28:
    case 30:
      return "gnu-long-path";
  }

  return null;
}

function cksum(block: Buffer) {
  var sum = 8 * 32;
  for (var i = 0; i < 148; i++) sum += block[i];
  for (var j = 156; j < 512; j++) sum += block[j];
  return sum;
}

const USTAR_MAGIC = Buffer.from("ustar\x00", "binary");
const MAGIC_OFFSET = 257;
const GNU_MAGIC = Buffer.from("ustar\x20", "binary");
const GNU_VER = Buffer.from("\x20\x00", "binary");
const VERSION_OFFSET = 263;
const ZERO_OFFSET = "0".charCodeAt(0);
