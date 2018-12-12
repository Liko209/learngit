/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/rtcRegistrationManager';

enum AccountState {
  IDLE,
  REGISTERED,
  FAILED,
  UNREGISTERED,
  IN_PROGRESS,
}

interface IRTCAccountListener {
  onAccountStateChanged(
    updateState: AccountState,
    originalState: AccountState,
  ): void;
}

class RTCAccount {
  private _registrationManager: RTCRegistrationManager;

  constructor(listener: IRTCAccountListener) {
    console.log('RTCAccout created');
    this._registrationManager = new RTCRegistrationManager(listener);
  }

  public deRegister() {
    this._registrationManager.deRegister();
  }

  public doRegister() {
    this._registrationManager.doRegister();
  }
}

export { AccountState, IRTCAccountListener, RTCAccount };
