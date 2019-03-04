/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 12:01:34
 * Copyright © RingCentral. All rights reserved.
 */
type Direction = 'up' | 'down';

interface IDataSource<K, V> {
  loadMore: (direction: Direction) => Promise<any>;
  loadInitialData: () => Promise<any>;
  hasMore: (direction: Direction) => boolean;
  isLoading: () => boolean;
  isLoadingInitialData: () => boolean;
  isLoadingMore: (direction: Direction) => boolean;
  get: (index: K) => V | undefined;
  size: () => number;
  total: () => number;
}

export { IDataSource, Direction };
