/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 10:25:13
 * Copyright © RingCentral. All rights reserved.
 */

import { AuthService } from 'sdk/service';

class PrivateRouteViewModel {
  private _authService: AuthService = AuthService.getInstance();

  get isAuthenticated() {
    return this._authService.isLoggedIn();
  }
}

export { PrivateRouteViewModel };
