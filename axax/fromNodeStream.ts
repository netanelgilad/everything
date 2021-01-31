import { Readable } from "stream";
import { Subject } from "./subject.ts";

export function fromNodeStream<T = Buffer>(stream: Readable) {
  const subject = new Subject<T>();

  stream.on("data", (chunk: T) => subject.onNext(chunk));

  stream.on("end", () => subject.onCompleted());
  stream.on("error", (e) => subject.onError(e));

  return subject.iterator;
}
