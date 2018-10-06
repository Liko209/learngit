/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-09-27 13:33:35
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';

import { IIDSortKey, ISortFunc } from '../store';
import ListStore from './ListStore';

const defaultSortFunc = (
  IdSortKeyPrev: IIDSortKey,
  IdSortKeyNext: IIDSortKey,
) => IdSortKeyPrev.sortKey - IdSortKeyNext.sortKey;

export default class OrderListStore extends ListStore<IIDSortKey> {
  sortFunc: (IdSortKeyPrev: IIDSortKey, IdSortKeyNext: IIDSortKey) => number;

  constructor(sortFunc: ISortFunc = defaultSortFunc) {
    super();
    this.sortFunc = sortFunc;
  }

  upsert(idArray: IIDSortKey[]) {
    const unionAndSortIds = _.unionBy(idArray, this.getItems(), 'id').sort(
      this.sortFunc,
    );

    this.replaceAll(unionAndSortIds);
  }

  // set({ id, sortKey }: IIDSortKey) {
  //   this.batchSet([{ id, sortKey }]);
  // }

  // batchSet(idArray: IIDSortKey[]) {
  //   if (!idArray.length) {
  //     return;
  //   }
  //   const unionAndSortIds = _.unionBy(idArray, this.getItems(), 'id').sort(
  //     this.sortFunc,
  //   );

  //   this.replaceAll(unionAndSortIds);
  // }

  removeById(ids: number[]) {
    ids.forEach((id: number) => {
      _.remove(this.getItems(), { id });
    });

    this._atom.reportChanged();
  }

  getIds() {
    this._atom.reportObserved();
    return _.map(this.getItems(), 'id');
  }

  getById(id: number) {
    this._atom.reportObserved();
    return _.find(this.getItems(), { id });
  }
}
