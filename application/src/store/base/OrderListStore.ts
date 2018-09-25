import { createAtom, IAtom } from 'mobx';
import _ from 'lodash';

import { IIDSortKey, ISortFunc } from '../store';

const defaultSortFunc = (
  IdSortKeyPrev: IIDSortKey,
  IdSortKeyNext: IIDSortKey,
) => IdSortKeyPrev.sortKey - IdSortKeyNext.sortKey;

export default class OrderListStore {
  idArray: IIDSortKey[] = [];
  idsAtom: IAtom;

  sortFunc: (IdSortKeyPrev: IIDSortKey, IdSortKeyNext: IIDSortKey) => number;

  constructor(sortFunc: ISortFunc = defaultSortFunc) {
    this.sortFunc = sortFunc;
    this.idsAtom = createAtom(`orderList: ${Math.random()}`);
  }

  set({ id, sortKey }: IIDSortKey) {
    this.batchSet([{ id, sortKey }]);
  }

  batchSet(idArray: IIDSortKey[]) {
    if (!idArray.length) {
      return;
    }
    const unionAndSortIds = _.unionBy(idArray, this.idArray, 'id').sort(
      this.sortFunc,
    );

    this.idArray = unionAndSortIds;
    this.idsAtom.reportChanged();
  }

  remove(id: number) {
    _.remove(this.idArray, { id });
    this.idsAtom.reportChanged();
  }

  batchRemove(ids: number[]) {
    ids.forEach((id: number) => {
      this.remove(id);
    });
  }

  clearAll() {
    this.idArray = [];
    this.idsAtom.reportChanged();
  }

  getIdArray() {
    return this.idArray;
  }

  getIds() {
    this.idsAtom.reportObserved();
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
