import { EventEmitter } from "events";
import { unwatchFile, watchFile } from "fs";
import { withCache } from "../withCache.ts";

export const watchFileEmitter = withCache(function watchFileGenerator(
  filename: string
) {
  const eventEmitter = new EventEmitter();

  watchFile(filename, () => {
    eventEmitter.emit("change");
  });
  return {
    stop() {
      unwatchFile(filename);
      eventEmitter.emit("end");
    },
    eventEmitter,
  };
});
