import { tmpdir as tmpdirOs } from "os";
import { AbsolutePathString } from "../filesystem/PathString.ts";

export const tmpdir = tmpdirOs as () => AbsolutePathString;
