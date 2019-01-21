/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import historyStack from '@/common/HistoryStack';
<<<<<<< HEAD:application/src/modules/home/container/Home/Home.ViewModel.ts
import isElectron from '@/common/isElectron';
import history from '@/history';
import { StoreViewModel } from '@/store/ViewModel';
import { Action, Location } from 'history';
import { action, observable } from 'mobx';
=======
import { StoreViewModel } from '@/store/ViewModel';
>>>>>>> hotfix/FIJI-2929:application/src/containers/Home/Home.ViewModel.tsx

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
export { HomeViewModel };
