/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-30 09:20:50
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCAccount } from '../RTCAccount';
import { EventEmitter2 } from 'eventemitter2';
import { IRTCAccountDelegate } from '../IRTCAccountDelegate';
import { WEBPHONE_SESSION_STATE, UA_EVENT } from '../../signaling/types';
import {
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallOptions,
} from '../types';

import { kRTCAnonymous } from '../../account/constants';
import { REGISTRATION_FSM_STATE } from '../../account/types';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { RTCNetworkNotificationCenter } from '../../utils/RTCNetworkNotificationCenter';

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

class MockRequest {
  public headers: any = {
    'P-Rc-Api-Ids': [
      {
        raw:
          'party-id=cs172622609264474468-2;session-id=Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw',
      },
    ],
  };
}

class MockResponse {
  public headers: any = {
    'P-Rc-Api-Ids': [
      {
        raw:
          'party-id=cs172622609264474468-2;session-id=Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw',
      },
    ],
  };
}

class MockSession extends EventEmitter2 {
  constructor() {
    super();
    this.remoteIdentity = {
      displayName: 'test',
      uri: { aor: 'test@ringcentral.com' },
    };
  }

  public request: MockRequest = new MockRequest();

  public remoteIdentity: any;

  mockSignal(signal: string, response?: any): void {
    this.emit(signal, response);
  }
  mute = jest.fn();
  unmute = jest.fn();
  terminate = jest.fn();
}

describe('networkChangeToOnline()', () => {
  it('should _onNetworkChangeToOnline() is called when rtcNetworkNotificationCenter call _onOnline()', () => {
    const mockListener = new MockAccountListener();
    const account = new RTCAccount(mockListener);
    jest.spyOn(account, '_onNetworkChange').mockClear();
    RTCNetworkNotificationCenter.instance()._onOnline();
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

  it('Should parse multi-party conference headers for incoming call. [JPT-1050]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
    setImmediate(() => {
      expect(account.callCount()).toBe(1);
      expect(account.callList()[0].getCallInfo().partyId).toBe(
        'cs172622609264474468-2',
      );
      expect(account.callList()[0].getCallInfo().sessionId).toBe(
        'Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw',
      );
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

  it('Should parse multi-party conference headers for outbound call. [JPT-1051]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    const session = new MockSession();
    call.onAccountReady();
    call.setCallSession(session);
    const res = new MockResponse();

    setImmediate(() => {
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED, res);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        expect(call.getCallInfo().partyId).toBe('cs172622609264474468-2');
        expect(call.getCallInfo().sessionId).toBe(
          'Y3MxNzI2MjI2MDkyNjQ0NzQ0NjhAMTAuNzQuMy4xNw',
        );
        done();
      });
    });
  });

  describe('makeAnonymousCall()', () => {
    it('Should call createOutgoingCallSession api with options include anonymous when have been called without options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const call = account.makeAnonymousCall('123', listener);
      const isAnonymous: boolean = call.isAnonymous();
      call.onAccountReady();
      setImmediate(() => {
        expect(account.createOutgoingCallSession).toHaveBeenCalledWith('123', {
          fromNumber: kRTCAnonymous,
        });
        expect(isAnonymous).toBeTruthy();
        done();
      });
    });

    it('Should call createOutgoingCallSession api with options include anonymous when have been called with options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const options: RTCCallOptions = { fromNumber: '234' };
      const call = account.makeAnonymousCall('123', listener, options);
      const isAnonymous: boolean = call.isAnonymous();
      call.onAccountReady();
      setImmediate(() => {
        expect(account.createOutgoingCallSession).toHaveBeenCalledWith('123', {
          fromNumber: kRTCAnonymous,
        });
        expect(isAnonymous).toBeTruthy();
        done();
      });
    });
  });
});
