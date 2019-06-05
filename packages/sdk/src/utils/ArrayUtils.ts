/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-28 17:21:48
 * Copyright © RingCentral. All rights reserved.
 */

import { QUERY_DIRECTION } from '../dao/constants';

class ArrayUtils {
  static sliceIdArray<T extends string | number>(
    idArray: T[],
    limit: number,
    anchorId?: T,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.NEWER,
  ) {
    let startIndex = 0;
    let endIndex = 0;
    if (anchorId) {
      const idIndex = idArray.indexOf(anchorId);
      if (direction === QUERY_DIRECTION.NEWER) {
        startIndex = idIndex + 1;
        endIndex =
          idIndex + limit >= idArray.length
            ? idArray.length
            : startIndex + limit;
      } else if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = idIndex - limit <= 0 ? 0 : idIndex - limit;
        endIndex = idIndex;
      } else {
        const offset =
          idArray[idArray.length - 1] !== anchorId
            ? Math.floor(limit / 2)
            : limit - 1;
        startIndex = idIndex - offset > 0 ? idIndex - offset : 0;
        const difEnd = startIndex + limit;
        endIndex = difEnd >= idArray.length ? idArray.length : difEnd;
      }
    } else {
      endIndex =
        direction !== QUERY_DIRECTION.OLDER
          ? startIndex + limit > idArray.length
            ? idArray.length
            : limit
          : idArray.length;
      if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = endIndex > limit ? endIndex - limit : 0;
      }
    }

    // Slice ids
    return idArray.slice(startIndex, endIndex);
  }
}

export { ArrayUtils };
