/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:06
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { service } from 'sdk';
import BasePresenter from '@/store/base/BasePresenter';

class ViewModel extends BasePresenter {
  private _authService: service.AuthService;

  constructor() {
    super();
    this._authService = service.AuthService.getInstance();
  }

  @computed
  get isAuthenticated() {
    return this._authService.isLoggedIn();
  }

  async unifiedLogin({ code, token }: { code?: string, token?: string }) {
    await this._authService.unifiedLogin({ code, token });
  }
}

export default ViewModel;
