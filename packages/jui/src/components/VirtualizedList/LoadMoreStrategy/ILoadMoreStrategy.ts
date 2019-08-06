/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-01 13:12:52
 * Copyright © RingCentral. All rights reserved.
 */
import { UndefinedAble, IndexRange, Delta, IndexConstraint } from '../types';
import { DIRECTION } from '../../Lists';

type LoadMoreStrategyParams = Readonly<{
  visibleRange: Readonly<IndexRange>;
  prevVisibleRange: Readonly<IndexRange>;
  prevVisibleRangeTime: number;
  indexConstraint: Readonly<IndexConstraint>;
  delta?: Readonly<Delta>;
}>;

type LoadMoreInfo = { direction?: DIRECTION; count: number };

interface ILoadMoreStrategy {
  getLoadMoreInfo(params: LoadMoreStrategyParams): LoadMoreInfo;
  getPreloadInfo(): UndefinedAble<LoadMoreInfo>;
}

export { ILoadMoreStrategy, LoadMoreStrategyParams, LoadMoreInfo };
