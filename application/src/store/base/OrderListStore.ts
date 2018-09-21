import _ from 'lodash';

import { IIDSortKey, ISortFunc } from '../store';
import ListStore from '@/store/base/ListStore';

const defaultSortFunc = (
  IdSortKeyPrev: IIDSortKey,
  IdSortKeyNext: IIDSortKey,
) => IdSortKeyPrev.sortKey - IdSortKeyNext.sortKey;

export default class OrderListStore extends ListStore<IIDSortKey> {
  constructor(public sortFunc: ISortFunc = defaultSortFunc) {
    super();
  }

  set({ id, sortKey }: IIDSortKey) {
    this.batchSet([{ id, sortKey }]);
  }

  batchSet(items: IIDSortKey[]) {
    if (!items.length) {
      return;
    }
    const unionAndSortIds = _.unionBy(items, this.items, 'id').sort(
      this.sortFunc,
    );
    this.items = unionAndSortIds;
    this.atom.reportChanged();
  }

  remove(id: number) {
    _.remove(this.items, { id });
    this.atom.reportChanged();
  }

  batchRemove(ids: number[]) {
    ids.forEach((id: number) => {
      this.remove(id);
    });
  }

  getIds() {
    this.atom.reportObserved();
    return _.map(this.items, 'id');
  }
  getIdArray() {
    return this.items;
  }
  get(id: number) {
    return _.find(this.items, { id });
  }
}
