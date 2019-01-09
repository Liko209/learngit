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
import { REGISTRATION_EVENT } from '../account/types';
import { RTCEngine } from './RTCEngine';
import { v4 as uuid } from 'uuid';
import { RTC_ACCOUNT_STATE } from './types';

const provisionData = {
  data: {
    device: {
      uri:
        'https://api-xmnup.lab.nordigy.ru/restapi/v1.0/account/142579004/device/803466956004',
      id: '803466956004',
      type: 'WebPhone',
      status: 'Online',
      phoneLines: [],
      linePooling: 'None',
    },
    sipInfo: [
      {
        transport: 'WSS',
        username: '18332118767*102',
        password: '4cwxTF5j1',
        authorizationId: '803466956004',
        domain: 'sip-xmnup.lab.nordigy.ru',
        outboundProxy: 'glip-sip-xmnup.lab.nordigy.ru:8083',
        switchBackInterval: 3600,
      },
    ],
    sipFlags: {
      voipFeatureEnabled: true,
      voipCountryBlocked: false,
      outboundCallsEnabled: true,
      dscpEnabled: false,
      dscpSignaling: 26,
      dscpVoice: 46,
      dscpVideo: 34,
    },
    sipErrorCodes: ['503', '502', '504'],
    pollingInterval: 7200,
  },
  status: 200,
  statusText: 'OK',
  headers: {
    date: 'Sat, 29 Dec 2018 06:53:40 GMT',
    'content-encoding': 'gzip',
    'x-rate-limit-limit': '60',
    routingkey: 'SJC01P01PAS01',
    'x-rate-limit-remaining': '59',
    'content-length': '429',
    rcrequestid: '7920b73c-0b36-11e9-94ee-005056bea257',
    'content-language': 'en-US',
    'x-rate-limit-group': 'heavy',
    'content-type': 'application/json; charset=UTF-8',
    'x-rate-limit-window': '60',
  },
  retryAfter: 6000,
};

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
  private _state: RTC_ACCOUNT_STATE;

  constructor(listener: IRTCAccountDelegate) {
    this._state = RTC_ACCOUNT_STATE.IDLE;
    this._delegate = listener;
    this._regManager = new RTCRegistrationManager();
    this._initListener();
  }

  public handleProvisioning() {
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
    this._regManager.provisionReady(provisionData.data, info);
  }

  public makeCall(toNumber: string, delegate: IRTCCallDelegate): RTCCall {
    const call = new RTCCall(false, toNumber, null, this, delegate);
    return call;
  }

  isReady(): boolean {
    return this._state === RTC_ACCOUNT_STATE.REGISTERED;
  }

  createOutCallSession(toNum: string): any {
    return this._regManager.createOutgoingCallSession(toNum, {});
  }

  private _initListener() {
    this._regManager.on(
      REGISTRATION_EVENT.RECEIVER_INCOMING_SESSION,
      (session: any) => {
        this._onReceiveInvite(session);
      },
    );
    this._regManager.on(
      REGISTRATION_EVENT.ACCOUNT_STATE_CHANGED,
      (state: RTC_ACCOUNT_STATE) => {
        this._onAccountStateChanged(state);
      },
    );
  }

  private _onAccountStateChanged(state: RTC_ACCOUNT_STATE) {
    if (this._state === state) {
      return;
    }
    this._state = state;
    if (this._delegate) {
      this._delegate.onAccountStateChanged(state);
    }
  }

  private _onReceiveInvite(session: any) {
    const call = new RTCCall(true, '', session, this, null);
    this._delegate.onReceiveIncomingCall(call);
  }
}

export { RTCAccount };
