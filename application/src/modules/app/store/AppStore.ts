/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-14 18:36:30
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, observable, action } from 'mobx';

class AppStore {
  readonly name = process.env.APP_NAME || '';

  @observable
  private _umi: number = 0;
  @observable
  private _globalLoading: boolean = false;

  @computed
  get umi() {
    return this._umi;
  }

  @action
  setUmi(umi: number) {
    this._umi = umi;
  }

  @computed
  get globalLoading() {
    return this._globalLoading;
  }

  @action
  setGlobalLoading(globalLoading: boolean) {
    this._globalLoading = globalLoading;
  }
}

export { AppStore };
