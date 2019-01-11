/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-30 09:20:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCAccount } from '../RTCAccount';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCAccountDelegate } from '../IRTCAccountDelegate';
import { UA_EVENT } from '../../signaling/types';
import { RTC_ACCOUNT_STATE } from '../../api/types';

class MockListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
}

class MockUserAgent {
  private _eventEmitter: EventEmitter2;
  constructor(eventEmitter: EventEmitter2, flag: boolean) {
    this._eventEmitter = eventEmitter;
    if (flag) {
      this._eventEmitter.emit(UA_EVENT.REG_SUCCESS);
    } else {
      this._eventEmitter.emit(UA_EVENT.REG_FAILED);
    }
  }
}

describe('RTCAccount', () => {
  describe('handleProvisioning', () => {
    it('Should report ready state when register success', () => {
      const listener = new MockListener();
      const account = new RTCAccount(listener);
      jest
        .spyOn(account._regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      account._onNewProv({});
      account._regManager._userAgent = new MockUserAgent(
        account._regManager._eventEmitter,
        true,
      );
      expect(listener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.REGISTERED,
      );
    });

    it('Should report failed state when register failed', () => {
      const listener = new MockListener();
      const account = new RTCAccount(listener);
      jest
        .spyOn(account._regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      account._onNewProv({});
      account._regManager._userAgent = new MockUserAgent(
        account._regManager._eventEmitter,
        false,
      );
      expect(listener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.FAILED,
      );
    });
  });
});
