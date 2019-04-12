/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-09 17:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import { fetchVersionInfo, versionInfoType } from '../helper';
import { computed, observable, action } from 'mobx';
import { GLOBAL_KEYS } from '@/store/constants';
import { storeManager } from '@/store';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import { LoginVersionStatusProps } from './types';

class LoginVersionStatusViewModel extends AbstractViewModel<
  LoginVersionStatusProps
> {
  private _globalStore = storeManager.getGlobalStore();

  @observable
  private _versionInfo: versionInfoType = {
    buildTime: '',
    buildCommit: '',
    buildVersion: '',
    deployedTime: '',
    deployedCommit: '',
    deployedVersion: '',
  };

  constructor() {
    super();
    this.getVersionInfo();
  }

  @action
  async getVersionInfo() {
    this._versionInfo = await fetchVersionInfo();
  }

  @computed
  get versionInfo() {
    return this._versionInfo;
  }

  @computed
  get electronVersionInfo() {
    const electronAppVersion = this._globalStore.get(
      GLOBAL_KEYS.ELECTRON_APP_VERSION,
    );
    const electronVersion = this._globalStore.get(GLOBAL_KEYS.ELECTRON_VERSION);

    return {
      electronAppVersion,
      electronVersion,
    };
  }
}

export { LoginVersionStatusViewModel };
