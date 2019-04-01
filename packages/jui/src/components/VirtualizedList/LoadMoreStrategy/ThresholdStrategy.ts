/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:14:44
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ILoadMoreStrategy,
  LoadMoreStrategyParams,
  LoadMoreInfo,
} from './ILoadMoreStrategy';

class ThresholdStrategy implements ILoadMoreStrategy {
  private _threshold: number;
  private _minBatchCount: number;
  private _maxBatchCount: number;

  constructor({
    threshold,
    minBatchCount,
    maxBatchCount,
  }: {
    threshold: number;
    minBatchCount: number;
    maxBatchCount: number;
  }) {
    this._threshold = threshold;
    this._minBatchCount = minBatchCount;
    this._maxBatchCount = maxBatchCount;
  }

  getLoadMoreInfo({
    visibleRange: { startIndex, stopIndex },
    prevVisibleRange,
    minIndex,
    maxIndex,
  }: Readonly<LoadMoreStrategyParams>): LoadMoreInfo {
    // Load up
    const startIndexDiff = startIndex - prevVisibleRange.startIndex;
    const distanceToMinIndex = startIndex - minIndex;
    const unloadCountUp = this._threshold - distanceToMinIndex;

    if (
      unloadCountUp >= this._minBatchCount &&
      Math.floor(startIndexDiff) < 0
    ) {
      return {
        direction: 'up',
        count: Math.min(unloadCountUp, this._maxBatchCount),
      };
    }

    // Load down
    const stopIndexDiff = stopIndex - prevVisibleRange.stopIndex;
    const distanceToMaxIndex = maxIndex - stopIndex;
    const unloadCountDown = this._threshold - distanceToMaxIndex;
    if (
      unloadCountDown >= this._minBatchCount &&
      Math.floor(stopIndexDiff) > 0
    ) {
      return {
        direction: 'down',
        count: Math.min(unloadCountDown, this._maxBatchCount),
      };
    }

    // Load nothing
    return { count: 0 };
  }
}

export { ThresholdStrategy };
