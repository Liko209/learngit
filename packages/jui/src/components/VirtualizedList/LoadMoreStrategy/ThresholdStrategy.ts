/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:14:44
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ILoadMoreStrategy,
  LoadMoreStrategyParams,
  LoadMoreInfo
} from './ILoadMoreStrategy';

import { UndefinedAble } from '../types';
import { DIRECTION } from 'jui/components/Lists';

const PRELOAD_COUNT_LIMIT = 50;
const DEFAULT_PAGE_SIZE = 20;

class ThresholdStrategy implements ILoadMoreStrategy {
  private _threshold: number;
  private _minBatchCount: number;
  private _preloadInfo: UndefinedAble<LoadMoreInfo>;

  constructor(
    {
      threshold,
      minBatchCount
    }: {
      threshold: number;
      minBatchCount: number;
    },
    preloadInfo?: LoadMoreInfo
  ) {
    this._threshold = threshold;
    this._minBatchCount = minBatchCount;
    this._preloadInfo = preloadInfo;
  }

  getLoadMoreInfo({
    indexConstraint: { minIndex, maxIndex },
    visibleRange: { startIndex, stopIndex },
    prevVisibleRange,
    delta
  }: Readonly<LoadMoreStrategyParams>): LoadMoreInfo {
    const deltaY = delta ? delta.y : 0;

    // Load up
    const startIndexDiff = startIndex - prevVisibleRange.startIndex;
    const distanceToMinIndex = startIndex - minIndex;
    const unloadCountUp = this._threshold - distanceToMinIndex;
    const isUpwards = Math.floor(startIndexDiff) < 0 || deltaY < 0;
    if (unloadCountUp >= this._minBatchCount && isUpwards) {
      return {
        direction: DIRECTION.UP,
        count: unloadCountUp
      };
    }

    // Load down
    const stopIndexDiff = stopIndex - prevVisibleRange.stopIndex;
    const distanceToMaxIndex = maxIndex - stopIndex;
    const unloadCountDown = this._threshold - distanceToMaxIndex;
    const isDownwards = Math.floor(stopIndexDiff) > 0 || deltaY > 0;
    if (unloadCountDown >= this._minBatchCount && isDownwards) {
      return {
        direction: DIRECTION.DOWN,
        count: unloadCountDown
      };
    }

    // Load nothing
    return { count: 0 };
  }

  getPreloadInfo(): UndefinedAble<LoadMoreInfo> {
    return this._preloadInfo;
  }

  updatePreloadCount(count: number) {
    if (this._preloadInfo) {
      const preloadCount = count - DEFAULT_PAGE_SIZE + 1;
      if (preloadCount >= PRELOAD_COUNT_LIMIT) {
        this._preloadInfo.count = PRELOAD_COUNT_LIMIT;
      } else if (preloadCount <= DEFAULT_PAGE_SIZE) {
        this._preloadInfo.count = DEFAULT_PAGE_SIZE;
      } else {
        this._preloadInfo.count = preloadCount;
      }
    }
  }
}

export { ThresholdStrategy };
