/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { GlobalSearchProps, GlobalSearchViewProps, SEARCH_VIEW } from './types';
import { GlobalSearchStore } from '../../store';

class GlobalSearchViewModel extends StoreViewModel<GlobalSearchProps>
  implements GlobalSearchViewProps {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  @computed
  get searchKey() {
    return this._globalSearchStore.searchKey;
  }

  @computed
  get open() {
    return this._globalSearchStore.open;
  }

  @computed
  get currentView() {
    return this._globalSearchStore.currentView;
  }

  @computed
  get showClear() {
    return this._globalSearchStore.searchKey !== '';
  }

  @action
  onClear = () => {
    this._globalSearchStore.clearSearchKey();
  }

  @action
  onChange = (searchKey: string) => {
    const store = this._globalSearchStore;
    const currentView =
      searchKey === '' ? SEARCH_VIEW.RECENT_SEARCH : SEARCH_VIEW.INSTANT_SEARCH;
    store.setCurrentView(currentView);
    store.setSearchKey(searchKey);
  }

  @action
  onClose = () => {
    this._globalSearchStore.setOpen(false);
  }
}

export { GlobalSearchViewModel };
