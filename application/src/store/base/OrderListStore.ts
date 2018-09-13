import _ from 'lodash';

import { IIDSortKey, ISortFunc } from '../store';
import ListStore from '@/store/base/ListStore';

const defaultSortFunc = (
  IdSortKeyPrev: IIDSortKey,
  IdSortKeyNext: IIDSortKey,
) => IdSortKeyPrev.sortKey - IdSortKeyNext.sortKey;

export default class OrderListStore extends ListStore<IIDSortKey> {
  constructor(public sortFunc: ISortFunc = defaultSortFunc) {
    super('id');
  }

  set({ id, sortKey }: IIDSortKey) {
    this.batchSet([{ id, sortKey }]);
  }

  batchSet(idArray: IIDSortKey[]) {
    if (!idArray.length) {
      return;
    }
    const unionAndSortIds = _.unionBy(idArray, this.items, 'id').sort(
      this.sortFunc,
    );

    this.items = unionAndSortIds;
    this.atom.reportChanged();
  }

  getIdArray() {
    return this.items;
  }
}
