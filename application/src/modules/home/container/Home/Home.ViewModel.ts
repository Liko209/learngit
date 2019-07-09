/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import historyStack from '@/common/HistoryStack';
import history from '@/history';
import { StoreViewModel } from '@/store/ViewModel';
import { Action, Location } from 'history';
import { action, observable, computed } from 'mobx';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';

class HomeViewModel extends StoreViewModel {
  @observable
  openCreateTeam: boolean = false;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  constructor() {
    super();
    this._initHistoryListen();
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }

  private _initHistoryListen() {
    history.listen((location: Location, action: Action) => {
      historyStack.updateStackNCursor();
      const { state, pathname } = location;
      if (state && state.navByBackNForward) {
        return;
      }
      if (action === 'PUSH') {
        historyStack.push(pathname);
      }
      if (action === 'REPLACE') {
        historyStack.replace(pathname);
      }
    });
  }

  @computed
  get showGlobalSearch() {
    return this._globalSearchStore.open;
  }
}
export { HomeViewModel };
