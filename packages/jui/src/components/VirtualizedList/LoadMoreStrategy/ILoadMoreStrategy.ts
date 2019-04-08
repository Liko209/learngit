/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:12:52
 * Copyright © RingCentral. All rights reserved.
 */
import { IndexRange, Delta, IndexConstraint } from '../types';

type LoadMoreStrategyParams = Readonly<{
  visibleRange: Readonly<IndexRange>;
  prevVisibleRange: Readonly<IndexRange>;
  prevVisibleRangeTime: number;
  indexConstraint: Readonly<IndexConstraint>;
  delta?: Readonly<Delta>;
}>;

type LoadMoreInfo = { direction?: 'up' | 'down'; count: number };

interface ILoadMoreStrategy {
  getLoadMoreInfo(params: LoadMoreStrategyParams): LoadMoreInfo;
}

export { ILoadMoreStrategy, LoadMoreStrategyParams, LoadMoreInfo };
