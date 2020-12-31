import { types } from "util";
import { Assertion, Within, Otherwise, isOtherwise } from "./Assertion.ts";

export async function assertThat<T>(
  something: T,
  assertion: Assertion<T>,
  within?: Within,
  otherwise?: Otherwise
): Promise<void>;
export async function assertThat<T>(
  something: T,
  assertion: Assertion<T>,
  otherwise?: Otherwise
): Promise<void>;
export async function assertThat<T>(
  something: T,
  assertion: Assertion<T>,
  otherwiseOrWithin?: Otherwise | Within,
  maybeOtherwise?: Otherwise
): Promise<void> {
  const otherwise = isOtherwise(otherwiseOrWithin)
    ? otherwiseOrWithin
    : maybeOtherwise;
  try {
    await new Promise<void>((resolve, reject) => {
      try {
        const maybePromise = assertion(something);
        if (types.isPromise(maybePromise)) {
          (maybePromise as Promise<void>)
            .then(() => {
              resolve();
            })
            .catch(reject);
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    if (otherwise) {
      const moreInfo = await otherwise.value(err);
      if (moreInfo) {
        err.message += "\n\nMore Information provided:\n" + moreInfo;
      }
      throw err;
    } else {
      throw err;
    }
  }
}
