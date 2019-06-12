/*
 * @Author: Paynter Chen
 * @Date: 2019-05-28 13:00:22
 * Copyright © RingCentral. All rights reserved.
 */

async function findFirst<R, T>(
  arr: R[],
  transform: (rawItem: R) => Promise<T>,
  isMatch: (it: T) => boolean,
): Promise<T | null> {
  for (let index = 0; index < arr.length; index++) {
    const element = arr[index];
    const transformElement = await transform(element);
    if (isMatch(transformElement)) {
      return transformElement;
    }
  }
  return null;
}

export { findFirst };
