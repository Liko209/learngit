import { IVirtualListDataSource } from '../VirtualListDataSource';

const generateDemoData = (count: number) => {
  const items = [];
  const part = ['Hello', 'This is title', 'A long text'];
  for (let i = 0; i < count; i++) {
    items.push(part[i % 3]);
  }
  return items;
};

abstract class AbstractDemoInfiniteDataSource<K, V>
  implements IVirtualListDataSource<K, V> {
  private _map: Map<K, V> = new Map();
  private _loading: boolean = false;
  private _loadingMoreDown: boolean = false;

  abstract loadMore(startIndex: number, endIndex: number): Promise<any>;
  abstract hasMore(): boolean;

  constructor() {
    const originLoadMore = this.loadMore;
    this.loadMore = async (startIndex: number, endIndex: number) => {
      if (this.isLoading()) return;

      this._loadingMoreDown = true;
      await originLoadMore.apply(this, [startIndex, endIndex]);
      this._loadingMoreDown = false;
    };
  }

  protected set(k: K, v: V) {
    this._map.set(k, v);
  }

  get(key: K) {
    return this._map.get(key);
  }

  size() {
    return this._map.size;
  }

  isLoadingMore(direction: 'up' | 'down') {
    if ('down' === direction) {
      return this._loadingMoreDown;
    }
    return false;
  }

  isLoadingContent() {
    return this._loading;
  }

  isLoading() {
    return this.isLoadingContent() || this.isLoadingMore('down');
  }
}

/**
 * A data source that can not be
 * modified after it was initialized
 */
class DemoStaticDataSource implements IVirtualListDataSource<number, string> {
  private _items: string[] = [];

  initDemoData(count: number) {
    this._items = generateDemoData(count);
  }

  size() {
    return this._items.length;
  }

  get(i: number) {
    return this._items[i];
  }

  hasMore() {
    return false;
  }
}

/**
 * A data source that can be load many times
 */
class DemoInfiniteDataSource extends AbstractDemoInfiniteDataSource<
  number,
  string
> {
  private _total: number;
  private _dataLoadTime: number;

  constructor(total: number, dataLoadTime: number) {
    super();
    this._total = total;
    this._dataLoadTime = dataLoadTime;
  }

  private _appendDemoData(count: number) {
    this._batchSet(generateDemoData(count));
  }

  private _batchSet(arr: string[]) {
    arr.forEach((item: string) => {
      const key = this.size();
      this.set(key, item);
    });
  }

  async loadInitialData() {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        this._appendDemoData(15);
        resolve();
      },         this._dataLoadTime);
    });
  }

  async loadMore(startIndex: number, stopIndex: number) {
    const maxIndex = this._total - 1;
    if (this.size() >= this._total) return;

    return new Promise((resolve: any) => {
      setTimeout(() => {
        const actualStopIndex = Math.min(stopIndex, maxIndex);
        this._appendDemoData(actualStopIndex - startIndex + 1);
        resolve();
      },         this._dataLoadTime);
    });
  }

  hasMore() {
    return this._total > this.size();
  }
}

export {
  AbstractDemoInfiniteDataSource,
  DemoStaticDataSource,
  DemoInfiniteDataSource,
};
