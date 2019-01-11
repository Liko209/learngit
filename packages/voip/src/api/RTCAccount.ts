/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2018-12-06 13:12:30
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRegistrationManager } from '../account/RTCRegistrationManager';
import { IRTCAccountDelegate } from './IRTCAccountDelegate';
import { IRTCAccount } from '../account/IRTCAccount';
import { RTCCall } from './RTCCall';
import { IRTCCallDelegate } from './IRTCCallDelegate';
import {
  RegistrationManagerEvent,
  RTCSipProvisionInfo,
  RTC_PROV_EVENT,
} from '../account/types';
import { RTCEngine } from './RTCEngine';
import { v4 as uuid } from 'uuid';
import { RTCProvManager } from '../account/RTCProvManager';

const options = {
  appKey: 'YCWFuqW8T7-GtSTb6KBS6g',
  appName: 'RingCentral',
  appVersion: '0.1.0',
  endPointId: 'FVKGRbLRTxGxPempqg5f9g',
  audioHelper: {
    enabled: true,
  },
  logLevel: 10,
};

class RTCAccount implements IRTCAccount {
  private _regManager: RTCRegistrationManager;
  private _delegate: IRTCAccountDelegate;
  private _provManager: RTCProvManager;

  constructor(listener: IRTCAccountDelegate) {
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager(this._delegate);
    this._regManager._eventEmitter.on(
      RegistrationManagerEvent.RECEIVER_INCOMING_SESSION,
      (session: any) => {
        this._onReceiveInvite(session);
      },
    );

    this._provManager = new RTCProvManager();
    this._provManager.on(RTC_PROV_EVENT.NEW_PROV, ({ info }) => {
      this._onNewProv(info);
    });
  }

  public handleProvisioning() {
    this._provManager.acquireSipProv();
  }

  public makeCall(toNumber: string, delegate: IRTCCallDelegate): RTCCall {
    const call = new RTCCall(false, toNumber, null, this, delegate);
    return call;
  }

  isReady(): boolean {
    if (this._regManager === null) {
      return false;
    }
    return this._regManager.isReady();
  }

  createOutCallSession(toNum: string): any {
    return this._regManager.createOutgoingCallSession(toNum, {});
  }

  private _onReceiveInvite(session: any) {
    const call = new RTCCall(true, '', session, this, null);
    this._delegate.onReceiveIncomingCall(call);
  }

  private _onNewProv(sipProv: RTCSipProvisionInfo) {
    if (!this._regManager) {
      return;
    }
    const info = {
      appKey: options.appKey,
      appName: options.appName,
      appVersion: options.appVersion,
      endPointId: uuid(),
      audioHelper: options.audioHelper,
      logLevel: options.logLevel,
      media: {
        remote: RTCEngine.getInstance().getRemoteAudio(),
        local: RTCEngine.getInstance().getLocalAudio(),
      },
    };
    this._regManager.provisionReady(sipProv, info);
  }
}

export { RTCAccount };
