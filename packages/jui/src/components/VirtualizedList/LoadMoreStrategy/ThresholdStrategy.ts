/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:14:44
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  ILoadMoreStrategy,
  LoadMoreStrategyParams,
  LoadMoreInfo,
} from './ILoadMoreStrategy';

class ThresholdStrategy implements ILoadMoreStrategy {
  private _threshold: number;
  private _minBatchCount: number;

  constructor({
    threshold,
    minBatchCount,
  }: {
    threshold: number;
    minBatchCount: number;
  }) {
    this._threshold = threshold;
    this._minBatchCount = minBatchCount;
  }

  getLoadMoreInfo({
    indexConstraint: { minIndex, maxIndex },
    visibleRange: { startIndex, stopIndex },
    prevVisibleRange,
    delta,
  }: Readonly<LoadMoreStrategyParams>): LoadMoreInfo {
    const deltaY = delta ? delta.y : 0;

    // Load up
    const startIndexDiff = startIndex - prevVisibleRange.startIndex;
    const distanceToMinIndex = startIndex - minIndex;
    const unloadCountUp = this._threshold - distanceToMinIndex;
    const isUpwards = Math.floor(startIndexDiff) < 0 || deltaY < 0;
    if (unloadCountUp >= this._minBatchCount && isUpwards) {
      return {
        direction: 'up',
        count: unloadCountUp,
      };
    }

    // Load down
    const stopIndexDiff = stopIndex - prevVisibleRange.stopIndex;
    const distanceToMaxIndex = maxIndex - stopIndex;
    const unloadCountDown = this._threshold - distanceToMaxIndex;
    const isDownwards = Math.floor(stopIndexDiff) > 0 || deltaY > 0;
    if (unloadCountDown >= this._minBatchCount && isDownwards) {
      return {
        direction: 'down',
        count: unloadCountDown,
      };
    }

    // Load nothing
    return { count: 0 };
  }
}

export { ThresholdStrategy };
