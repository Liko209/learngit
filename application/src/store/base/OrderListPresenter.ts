import _ from 'lodash';
import BasePresenter from './BasePresenter';
import OrderListStore from './OrderListStore';

const DEFAULT_PAGE_SIZE = 20;

export default class OrderListPresenter extends BasePresenter {
  private store: OrderListStore;
  private hasBigger: boolean;
  private hasSmaller: boolean;
  private pageSize: number;
  private isMatchedFunc: Function;
  private transformFunc: Function;

  constructor(
    store: OrderListStore,
    isMatchedFunc: Function,
    transformFunc: Function,
  ) {
    super();
    this.store = store;

    this.hasBigger = false;
    this.hasSmaller = false;
    this.pageSize = DEFAULT_PAGE_SIZE;
    this.isMatchedFunc = isMatchedFunc;
    this.transformFunc = transformFunc;
  }

  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
  }

  handleIncomingData(entityName: string, { type, entities }: IIncomingData) {
    if (!entities.size) {
      return;
    }
    const existKeys = this.store.getIds();
    const keys = Array.from(entities.keys());
    const matchedKeys = _.intersection(keys, existKeys);
    const differentKeys = _.difference(keys, existKeys);

    if (type === 'delete') {
      this.store.batchRemove(matchedKeys);
    } else {
      const matchedIDSortKeyArray: IIDSortKey[] = [];
      const matchedEntities: IEntity[] = [];
      const notMatchedKeys: number[] = [];

      if (type === 'replace') {
        matchedKeys.forEach((key) => {
          const model = entities.get(key) as IEntity;
          const { data } = model;
          if (this.isMatchedFunc(data)) {
            const idSortKey = this.transformFunc(data);
            matchedIDSortKeyArray.push(idSortKey);
            matchedEntities.push(data);
          }
          notMatchedKeys.push(key);
        });
      } else if (type === 'replaceAll') {
        entities.forEach((data) => {
          if (this.isMatchedFunc(data)) {
            const idSortKey = this.transformFunc(data);
            matchedIDSortKeyArray.push(idSortKey);
            matchedEntities.push(data);
          }
        });
        notMatchedKeys.push(...existKeys);
      } else {
        matchedKeys.forEach((key) => {
          const model = entities.get(key) as IEntity;
          if (this.isMatchedFunc(model)) {
            const idSortKey = this.transformFunc(model);
            matchedIDSortKeyArray.push(idSortKey);
            matchedEntities.push(model);
          } else {
            notMatchedKeys.push(key);
          }
        });
      }

      differentKeys.forEach((key) => {
        const model = entities.get(key) as IEntity;
        if (this.isMatchedFunc(model)) {
          const idSortKey = this.transformFunc(model);
          if (this.isInRange(idSortKey.sortKey)) {
            matchedIDSortKeyArray.push(idSortKey);
            matchedEntities.push(model);
          }
        }
      });
      this.store.batchRemove(notMatchedKeys);
      this.updateEntityStore(entityName, matchedEntities);
      this.store.batchSet(matchedIDSortKeyArray);
    }

    // this.store.dump();
  }

  isInRange(sortKey: number | string) {
    let inRange = false;
    const idArray = this.store.getIdArray();
    if (idArray && idArray.length > 0) {
      const smallest = idArray[0];
      const biggest = idArray[idArray.length - 1];
      inRange = sortKey >= smallest.sortKey && sortKey <= biggest.sortKey;
      if (!inRange) {
        inRange =
          (sortKey < smallest.sortKey && !this.hasSmaller) ||
          (sortKey > biggest.sortKey && !this.hasBigger);
      }
    } else {
      inRange = !(this.hasBigger && this.hasSmaller);
    }

    return inRange;
  }

  getStore() {
    return this.store;
  }

  handlePageData(entityName: string, dataModels: IEntity[], isBigger: boolean) {
    if (!dataModels.length) {
      return;
    }
    const handledData: IIDSortKey[] = [];
    dataModels.forEach((item, index) => {
      handledData.push(this.transformFunc(item, index));
    });

    if (isBigger) {
      this.hasBigger = dataModels.length >= this.pageSize;
    } else {
      this.hasSmaller = dataModels.length >= this.pageSize;
    }
    this.updateEntityStore(entityName, dataModels);
    this.store.batchSet(handledData);
    // this.store.dump();
  }

  dispose() {
    super.dispose();
    this.store.dispose();
  }
}
