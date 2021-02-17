import { Deferred } from "./deferred.ts";
import { Subject } from "./subject.ts";
import { StopError, toCallbacks } from "./toCallbacks.ts";

/**
 * Runs a filter function over an asynchronous iterable
 */
export function concurrentFilter<T>(
  predicate: (t: T) => Promise<boolean>,
  concurrency: number
) {
  return function inner(source: AsyncIterable<T>) {
    const subject = new Subject<T>();
    let done = false;
    subject.finally(() => {
      done = true;
    });
    let running = 0;
    let deferred = new Deferred<void>();
    toCallbacks<T>((result) => {
      if (done) {
        throw new StopError();
      }
      if (!result.done) {
        running += 1;
        if (running >= concurrency) {
          deferred = new Deferred<void>();
        }
        predicate(result.value).then((value) => {
          running -= 1;
          if (value) {
            subject.onNext(result.value);
          }
          if (running < concurrency) {
            deferred.resolve();
          }
        });
        return deferred.promise;
      } else {
        subject.onCompleted();
        return Promise.resolve();
      }
    })(source);
    return subject.iterator;
  };
}
