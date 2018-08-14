import { observable, action, IObservableArray } from 'mobx';
import _ from 'lodash';

import BaseStore from './BaseStore';

export default class OrderListStore extends BaseStore {
  idArray: IObservableArray<IIDSortKey> = observable.array([], { deep: false });

  sortFunc: (IdSortKeyPrev: IIDSortKey, IdSortKeyNext: IIDSortKey) => number;

  constructor(name: string) {
    super(name);
    this.sortFunc = (IdSortKeyPrev: IIDSortKey, IdSortKeyNext: IIDSortKey) =>
      IdSortKeyPrev.sortKey - IdSortKeyNext.sortKey;
  }

  @action
  set({ id, sortKey }: IIDSortKey) {
    this.batchSet([{ id, sortKey }]);
  }

  @action
  batchSet(idArray: IIDSortKey[]) {
    if (!idArray.length) {
      return;
    }
    // console.log(`===> original batchAdd: ${JSON.stringify(idArray)}`);
    const unionAndSortIds = _
      .unionBy(idArray, this.idArray, 'id')
      .sort(this.sortFunc);
    // this.idArray = _.unionBy(idArray, this.idArray, 'id');
    // console.log(`===>concat batchAdd: ${JSON.stringify(this.idArray)}`);
    this.idArray.replace(unionAndSortIds);
    // this.idArray = this.idArray.sort(this.sortFunc);
    // console.log(`===>after sort batchAdd: ${JSON.stringify(this.idArray)}`);
  }

  @action
  remove(id: number) {
    _.remove(this.idArray, { id });
  }

  @action
  batchRemove(ids: number[]) {
    ids.forEach((id) => {
      this.remove(id);
    });
  }

  @action
  clearAll() {
    this.idArray.replace([]);
  }

  getIdArray() {
    return this.idArray;
  }

  getIds() {
    return _.map(this.idArray, 'id');
  }

  getSize() {
    return this.idArray.length;
  }

  get(id: number) {
    return _.find(this.idArray, { id });
  }

  first() {
    return this.idArray[0];
  }

  last() {
    return this.idArray[this.getSize() - 1];
  }

  dump(...args: any[]) {
    console.log(`===> dump: ${JSON.stringify(this.idArray)}`, args);
  }
}
