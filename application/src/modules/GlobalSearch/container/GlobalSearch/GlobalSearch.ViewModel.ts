/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { GlobalSearchProps, GlobalSearchViewProps } from './types';
import { GlobalSearchStore } from '../../store';

class GlobalSearchViewModel extends StoreViewModel<GlobalSearchProps>
  implements GlobalSearchViewProps {
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  @computed
  get open() {
    return this._globalSearchStore.open;
  }

  @action
  onClose = () => {
    this._globalSearchStore.setOpen(false);
  }
}

export { GlobalSearchViewModel };
