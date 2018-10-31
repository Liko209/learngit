/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-31 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { StoreViewModel } from '@/store/ViewModel';
import { computed, action, observable } from 'mobx';

class AboutPageViewModel extends StoreViewModel {
  @observable
  isShowDialog: boolean = false;
  @observable
  private _appVersion = '';
  @observable
  private _electronVersion = '';
  @action.bound
  handleAboutPage = (
    event: React.MouseEvent<HTMLElement>,
    appVersion?: string | undefined,
    electronVersion?: string | undefined,
  ) => {
    console.log('handleAboutPage');
    this._appVersion = appVersion || '';
    this._electronVersion = electronVersion || '';
    this.isShowDialog = !this.isShowDialog;
    console.log('isShowDialog', this.isShowDialog);
  }
  @computed
  get dialogStatus() {
    console.log('dialogStatus', this.isShowDialog);
    return this.isShowDialog;
  }
  @computed
  get electronVersion() {
    return this._electronVersion;
  }
  @computed
  get appVersion() {
    return this._appVersion;
  }
}
const aboutPageViewModel = new AboutPageViewModel();
export default AboutPageViewModel;
export { aboutPageViewModel };
