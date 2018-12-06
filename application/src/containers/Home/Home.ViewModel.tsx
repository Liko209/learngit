/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Location, Action } from 'history';
import { action, observable } from 'mobx';
import history from '@/history';
import historyStack from '@/common/HistoryStack';
import { StoreViewModel } from '@/store/ViewModel';
import isElectron from '@/common/isElectron';

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

  private _initHistoryListen() {
    if (isElectron) {
      history.listen((location: Location, action: Action) => {
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
  }
}
export { HomeViewModel };
