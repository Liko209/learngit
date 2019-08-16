/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { GlobalSearchStore } from '../../store';
import { GlobalSearchService } from '../../service';
import { SEARCH_SCOPE } from '../../types';
import { FullSearchProps, FullSearchViewProps, TAB_TYPE } from './types';

class FullSearchViewModel extends StoreViewModel<FullSearchProps>
  implements FullSearchViewProps {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );
  private _globalSearchService = container.get(GlobalSearchService);

  jumpToConversationCallback = () => {
    if (this._globalSearchStore.open) {
      this._globalSearchService.closeGlobalSearch();
      this._globalSearchStore.clearSearchKey();
    }
  }

  @computed
  get currentTab() {
    return this._globalSearchStore.currentTab;
  }

  @action
  setCurrentTab = (tab: TAB_TYPE) => {
    this._globalSearchStore.setCurrentTab(tab);
  }

  @action
  resetSearchScope = () => {
    this._globalSearchStore.setSearchScope(SEARCH_SCOPE.GLOBAL);
  }
}

export { FullSearchViewModel };
