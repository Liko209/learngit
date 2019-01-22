/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-30 09:20:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCAccount } from '../RTCAccount';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCAccountDelegate } from '../IRTCAccountDelegate';
import { UA_EVENT } from '../../signaling/types';
import {
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallOptions,
} from '../types';
import { REGISTRATION_FSM_STATE } from '../../account/types';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { rtcNetworkNotificationCenter } from '../../utils/RTCNetworkNotificationCenter';

class MockAccountListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
}

class MockCallListener implements IRTCCallDelegate {
  onCallStateChange(state: RTC_CALL_STATE): void {}
  onCallActionSuccess(callAction: RTC_CALL_ACTION): void {}
  onCallActionFailed(callAction: RTC_CALL_ACTION): void {}
}

class MockUserAgent extends EventEmitter2 {
  constructor() {
    super();
  }
  mockSignal(signal: any) {
    this.emit(signal);
  }
  makeCall(phoneNumber: string, options: RTCCallOptions): any {
    return new MockSession();
  }
}
class MockSession extends EventEmitter2 {
  constructor() {
    super();
    this.remoteIdentity = {
      displayName: 'test',
      uri: { aor: 'test@ringcentral.com' },
    };
  }
  public remoteIdentity: any;
}

describe('networkChangeToOnline()', () => {
  it('should _onNetworkChangeToOnline() is called when rtcNetworkNotificationCenter call _onOnline()', () => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    jest.spyOn(account, '_onNetworkChange').mockClear();
    rtcNetworkNotificationCenter._onOnline();
    expect(account._onNetworkChange).toHaveBeenCalledWith({
      state: 'online',
    });
    account.destroy();
  });
});

describe('RTCAccount', async () => {
  let mockListener: MockAccountListener;
  let account: RTCAccount = null;
  let ua: MockUserAgent;
  function setupAccount() {
    if (account) {
      account.destroy();
      account = null;
    }
    mockListener = new MockAccountListener();
    account = new RTCAccount(mockListener);
    ua = new MockUserAgent();
    jest
      .spyOn(account._regManager, 'onProvisionReadyAction')
      .mockImplementation(() => {});
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    account._onNewProv({});
  }

  it('Should  Report registered state to upper layer when account state transient to registered [JPT-528]', done => {
    setupAccount();
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
    setupAccount();
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
    setupAccount();
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
    setupAccount();
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

  it('Should return null when make call and new call is not allowed. [JPT-805]', () => {
    setupAccount();
    const listener = new MockCallListener();
    const call1 = account.makeCall('123', listener);
    const call2 = account.makeCall('234', listener);
    expect(call2).toBe(null);
  });

  it('Should do nothing when receive incoming call and new call is not allowed. [JPT-809]', () => {
    setupAccount();
    const listener = new MockCallListener();
    const call1 = account.makeCall('123', listener);
    ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
    expect(mockListener.onReceiveIncomingCall).not.toBeCalled();
  });

  it('Should call count set to 1 and return call when outbound call is allowed. [JPT-806]', () => {
    setupAccount();
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    expect(account.callCount()).toBe(1);
    expect(call).not.toBe(null);
  });

  it('Should call count set to 1 and return call when receive incoming call and new call is allowed. [JPT-810]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
    setImmediate(() => {
      expect(account.callCount()).toBe(1);
      expect(mockListener.onReceiveIncomingCall).toBeCalled();
      done();
    });
  });

  it('Should call count set to 0 when active call hangup. [JPT-807]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call1 = account.makeCall('123', listener);
    call1.hangup();
    setImmediate(() => {
      expect(account.callCount()).toBe(0);
      done();
    });
  });

  it('Should call count set to 0 when active call session disconnected. [JPT-808]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    const session = new MockSession();
    call.onAccountReady();
    call.setCallSession(session);
    session.emit('bye');
    setImmediate(() => {
      expect(account.callCount()).toBe(0);
      done();
    });
  });

  describe('makeAnonymousCall()', () => {
    it('Should call createOutgoingCallSession api with options include anonymous is true when have been called without options param', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const call = account.makeAnonymousCall('123', listener);
      call.onAccountReady();
      setImmediate(() => {
        expect(account.createOutgoingCallSession).toHaveBeenCalledWith('123', {
          anonymous: true,
        });
        done();
      });
    });

    it('Should call createOutgoingCallSession api with options include anonymous is true when have been called with options param', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const options: RTCCallOptions = { fromNumber: '234' };
      const call = account.makeAnonymousCall('123', listener, options);
      call.onAccountReady();
      setImmediate(() => {
        expect(account.createOutgoingCallSession).toHaveBeenCalledWith('123', {
          anonymous: true,
          fromNumber: '234',
        });
        done();
      });
    });
  });
});
