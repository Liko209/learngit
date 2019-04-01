/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:12:52
 * Copyright © RingCentral. All rights reserved.
 */
import { IndexRange } from '../types';

type LoadMoreStrategyParams = {
  visibleRange: Readonly<IndexRange>;
  prevVisibleRange: Readonly<IndexRange>;
  prevVisibleRangeTime: number;
  minIndex: number;
  maxIndex: number;
};

type LoadMoreInfo = { direction?: 'up' | 'down'; count: number };

interface ILoadMoreStrategy {
  getLoadMoreInfo(params: LoadMoreStrategyParams): LoadMoreInfo;
}

export { ILoadMoreStrategy, LoadMoreStrategyParams, LoadMoreInfo };
