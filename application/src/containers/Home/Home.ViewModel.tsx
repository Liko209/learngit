/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Location, Action } from 'history';
import { action, observable, computed } from 'mobx';
import history from '@/history';
import historyStack from '@/common/HistoryStack';
import { StoreViewModel } from '@/store/ViewModel';
import isElectron from '@/common/isElectron';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class HomeViewModel extends StoreViewModel {
  @observable
  openCreateTeam: boolean = false;
  constructor() {
    super();
    this._initHistoryListen();
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }

  @computed
  get isOpen() {
    return getGlobalValue(GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG) || false;
  }

  private _initHistoryListen() {
    if (isElectron) {
      history.listen((location: Location, action: Action) => {
        const { state, pathname } = location;
        if (state && state.navByBackNForward) {
          return;
        }
        if (historyStack.getCurrentPathname() === pathname) {
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
  }
}
export { HomeViewModel };
