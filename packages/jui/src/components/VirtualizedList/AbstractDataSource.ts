/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-04 12:02:01
 * Copyright © RingCentral. All rights reserved.
 */

import { Direction, IDataSource } from './IDataSource';

abstract class AbstractDataSource<K, V> implements IDataSource<K, V> {
  abstract loadMore: (direction: Direction) => Promise<void>;
  abstract loadInitialData: () => Promise<void>;
  abstract hasMore: (direction: Direction) => boolean;
  abstract isLoadingInitialData: () => boolean;
  abstract isLoadingMore: (direction: Direction) => boolean;
  abstract get: (index: K) => V | undefined;
  abstract size: () => number;
  abstract total: () => number;

  isLoading() {
    return (
      this.isLoadingInitialData() ||
      this.isLoadingMore('up') ||
      this.isLoadingMore('down')
    );
  }
}

export { AbstractDataSource };
