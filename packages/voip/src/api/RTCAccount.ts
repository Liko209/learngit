/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';

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
  }

  public deRegister() {}

  public doRegister() {}
}

export { AccountState, IRTCAccountListener, RTCAccount };
