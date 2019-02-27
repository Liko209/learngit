/*
 * @Author: isaac.liu
 * @Date: 2019-01-02 15:02:50
 * Copyright © RingCentral. All rights reserved.
 */
interface IVirtualListDataSource<K, V> {
  loadMore?: (
    startIndex: number,
    endIndex: number,
    direction: 'up' | 'down',
  ) => Promise<any>;
  infiniteLoadMore?: (startIndex: number, endIndex: number) => Promise<any>;
  loadInitialData?: () => Promise<any>;
  hasMore?: (direction: 'up' | 'down') => boolean;
  isLoading?: () => boolean;
  isLoadingContent?: () => boolean;
  isLoadingMore?: (direction: 'up' | 'down') => boolean;
  get: (index: K) => V | undefined;
  size: () => number;
  total?: () => number;
}

export { IVirtualListDataSource };
