/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-28 17:21:48
 * Copyright © RingCentral. All rights reserved.
 */

import { QUERY_DIRECTION } from '../dao/constants';
import { IdModel } from 'sdk/framework/model';

class ArrayUtils {
  static sliceIdArray<T extends string | number>(
    idArray: T[],
    limit: number,
    anchorId?: T,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.NEWER,
  ) {
    return ArrayUtils.sliceArrayBase(
      idArray,
      limit,
      (lsh: T, rsh: T) => {
        return lsh === rsh;
      },
      anchorId,
      direction,
    ).data;
  }

  static sliceIdModelArray<T extends IdModel>(
    dataArray: T[],
    limit: number,
    anchor?: T,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.NEWER,
  ) {
    return ArrayUtils.sliceArrayBase(
      dataArray,
      limit,
      (lsh: T, rsh: T) => {
        return lsh.id === rsh.id;
      },
      anchor,
      direction,
    );
  }

  private static sliceArrayBase<T>(
    dataArray: T[],
    limit: number,
    equalFunc: (lsh: T, rsh: T) => boolean,
    anchor?: T,
    direction: QUERY_DIRECTION = QUERY_DIRECTION.NEWER,
  ) {
    let startIndex = 0;
    let endIndex = 0;
    if (anchor) {
      let idIndex = 0;
      for (let i = 0; i < dataArray.length; ++i) {
        if (equalFunc(dataArray[i], anchor)) {
          idIndex = i;
          break;
        }
      }
      if (direction === QUERY_DIRECTION.NEWER) {
        startIndex = idIndex + 1;
        endIndex =
          idIndex + limit >= dataArray.length
            ? dataArray.length
            : startIndex + limit;
      } else if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = idIndex - limit <= 0 ? 0 : idIndex - limit;
        endIndex = idIndex;
      } else {
        const offset = !equalFunc(dataArray[dataArray.length - 1], anchor)
          ? Math.floor(limit / 2)
          : limit - 1;
        startIndex = idIndex - offset > 0 ? idIndex - offset : 0;
        const difEnd = startIndex + limit;
        endIndex = difEnd >= dataArray.length ? dataArray.length : difEnd;
      }
    } else {
      /* eslint-disable no-nested-ternary */
      endIndex =
        direction !== QUERY_DIRECTION.OLDER
          ? startIndex + limit > dataArray.length
            ? dataArray.length
            : limit
          : dataArray.length;
      if (direction === QUERY_DIRECTION.OLDER) {
        startIndex = endIndex > limit ? endIndex - limit : 0;
      }
    }

    let hasMore = false;
    if (direction === QUERY_DIRECTION.NEWER) {
      hasMore = endIndex < dataArray.length;
    } else if (direction === QUERY_DIRECTION.OLDER) {
      hasMore = startIndex > 0;
    }
    hasMore = hasMore && endIndex - startIndex === limit;

    return { data: dataArray.slice(startIndex, endIndex), hasMore };
  }
}

export { ArrayUtils };
