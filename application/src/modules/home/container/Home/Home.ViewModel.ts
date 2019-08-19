/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 19:12:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import historyStack from '@/common/HistoryStack';
import history from '@/history';
import { StoreViewModel } from '@/store/ViewModel';
import { Action, Location, UnregisterCallback } from 'history';
import { action, observable, computed } from 'mobx';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';
import { E911UIConfig } from '@/modules/telephony/E911.config';
import { TelephonyService } from '@/modules/telephony/service';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';

class HomeViewModel extends StoreViewModel {
  @observable
  openCreateTeam: boolean = false;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _E911UIConfig: E911UIConfig = container.get(E911UIConfig);

  private _unListen: UnregisterCallback;

  constructor() {
    super();
    this._initHistoryListen();
  }

  @action
  public toggleCreateTeam() {
    this.openCreateTeam = !this.openCreateTeam;
  }

  private _initHistoryListen() {
    this._unListen = history.listen((location: Location, action: Action) => {
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
    return this._globalSearchStore.alive;
  }

  dispose() {
    this._unListen();
  }

  openE911 = () => {
    this._telephonyService.openE911();
  };

  needConfirmE911 = async () => {
    return await this._telephonyService.needConfirmE911();
  };

  shouldShowE911 = () => {
    return this._E911UIConfig.getE911Marked();
  };

  markE911 = () => {
    this._E911UIConfig.setE911Marked(true);
  };
}
export { HomeViewModel };
