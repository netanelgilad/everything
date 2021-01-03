import { EventEmitter } from "events";
import { Subject } from "./subject.ts";

export function fromEmitter<T>(eventEmitter: EventEmitter, eventName: string) {
  const subject = new Subject<T>();
  eventEmitter.on(eventName, (event) => {
    subject.onNext(event);
  });
  return subject.iterator;
}
