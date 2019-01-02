/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountListener } from './IRTCAccountListener';

class RTCAccount {
  private _registrationManager: RTCRegistrationManager;

  constructor(listener: IRTCAccountListener) {
    console.log('RTCAccout created');
  }

  public deRegister() {}

  public doRegister() {}
}

export { RTCAccount };
