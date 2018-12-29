/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from './RTCRestApiManager';
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipProvisionInfo } from './types';

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo = null;
  private _errorRetryInterval: number = 8; // seconds
  private _reFreshInterval: number = 24 * 3600; // seconds
  private _reFreshTimerId: any = null;

  constructor() {
    super();
  }

  doSipProvRequest(): void {
    const receiveData: RTCSipProvisionInfo = rtcRestApiManager.sendRequest();
    if (this._checkInfoParame(receiveData)) {
    } else {
    }
  }

  private _onErrorHandling(): void {}
  private _checkInfoParame(info: RTCSipProvisionInfo): boolean {
    return true;
  }
  private _isInfoChange(): boolean {
    return true;
  }
  private _OnNewProv(): void {}
}
