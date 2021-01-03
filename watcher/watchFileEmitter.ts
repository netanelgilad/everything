import { EventEmitter } from "events";
import { watchFile } from "fs";
import { withCache } from "../withCache.ts";

export const watchFileEmitter = withCache(function watchFileGenerator(
  filename: string
) {
  const eventEmitter = new EventEmitter();

  watchFile(filename, () => {
    eventEmitter.emit("change");
  });
  return eventEmitter;
});
