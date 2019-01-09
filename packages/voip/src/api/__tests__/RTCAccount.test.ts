/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-30 09:20:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCAccount } from '../RTCAccount';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCAccountDelegate } from '../IRTCAccountDelegate';
import { UA_EVENT } from '../../signaling/types';
import { RTC_ACCOUNT_STATE } from '../types';
import { REGISTRATION_FSM_STATE } from '../../account/types';

class MockAccountListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
}

class MockUserAgent extends EventEmitter2 {
  constructor() {
    super();
  }
  mockSignal(signal: any) {
    this.emit(signal);
  }
}

describe('RTCAccount', async () => {
  it('Should  Report registered state to upper layer when account state transient to registered [JPT-528]', done => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    const ua = new MockUserAgent();
    jest
      .spyOn(account._regManager, 'onProvisionReadyAction')
      .mockImplementation(() => {});
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    account.handleProvisioning();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
      expect(account._state).toBe(RTC_ACCOUNT_STATE.REGISTERED);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.REGISTERED,
      );
      done();
    });
  });

  it('Should  Report InProgress state to upper layer when account state transient to InProgress [JPT-524]', done => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    const ua = new MockUserAgent();
    jest
      .spyOn(account._regManager, 'onProvisionReadyAction')
      .mockImplementation(() => {});
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    account.handleProvisioning();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.IN_PROGRESS,
      );
      expect(account._state).toBe(RTC_ACCOUNT_STATE.IN_PROGRESS);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.IN_PROGRESS,
      );
      done();
    });
  });

  it('Should  Report failed state to upper layer when account state transient to failed [JPT-525]', done => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    const ua = new MockUserAgent();
    jest
      .spyOn(account._regManager, 'onProvisionReadyAction')
      .mockImplementation(() => {});
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    account.handleProvisioning();
    ua.mockSignal(UA_EVENT.REG_FAILED);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.FAILURE,
      );
      expect(account._state).toBe(RTC_ACCOUNT_STATE.FAILED);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.FAILED,
      );
      done();
    });
  });

  it('Should  Report unregistered state to upper layer when account state transient to unregistered [JPT-562]', done => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    const ua = new MockUserAgent();
    jest
      .spyOn(account._regManager, 'onProvisionReadyAction')
      .mockImplementation(() => {});
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    account.handleProvisioning();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    ua.mockSignal(UA_EVENT.REG_UNREGISTER);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.UNREGISTERED,
      );
      expect(account._state).toBe(RTC_ACCOUNT_STATE.UNREGISTERED);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.UNREGISTERED,
      );
      done();
    });
  });
});
