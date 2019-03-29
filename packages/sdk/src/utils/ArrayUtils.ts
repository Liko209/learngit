/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-28 17:21:48
 * Copyright © RingCentral. All rights reserved.
 */

import { QUERY_DIRECTION } from '../dao/constants';

class ArrayUtils {
  static sliceIdArray(
    idArray: number[],
    limit: number,
    anchorPostId?: number,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.NEWER,
  ) {
    let startIndex = 0;
    let endIndex = 0;
    if (anchorPostId) {
      const postIdIndex = idArray.indexOf(anchorPostId);
      if (direction === QUERY_DIRECTION.NEWER) {
        startIndex = postIdIndex + 1;
        endIndex =
          postIdIndex + limit >= idArray.length
            ? idArray.length
            : startIndex + limit;
      } else if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = postIdIndex - limit <= 0 ? 0 : postIdIndex - limit;
        endIndex = postIdIndex;
      } else {
        const offset =
          idArray[idArray.length - 1] !== anchorPostId
            ? Math.floor(limit / 2)
            : limit - 1;
        startIndex = postIdIndex - offset > 0 ? postIdIndex - offset : 0;
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
