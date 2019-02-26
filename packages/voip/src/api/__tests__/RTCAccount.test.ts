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
import {
  REGISTRATION_FSM_STATE,
  RTCSipProvisionInfo,
} from '../../account/types';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { RTCNetworkNotificationCenter } from '../../utils/RTCNetworkNotificationCenter';
import { kProvisioningInfoKey } from '../../utils/constants';
import { ITelephonyDaoDelegate } from 'foundation/src';
import { RTCDaoManager } from '../../utils/RTCDaoManager';
import { RTCCall } from '../RTCCall';

class MockAccountListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
  onMadeOutgoingCall = jest.fn();
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
  unregister = jest.fn();
  reRegister = jest.fn();
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

class MockLocalStorage implements ITelephonyDaoDelegate {
  public prov: RTCSipProvisionInfo | null = null;

  put(key: string, value: any): void {
    this.prov = value;
  }
  get(key: string) {
    return this.prov;
  }
  remove(key: string): void {
    this.prov = null;
  }
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
  let localStorage: MockLocalStorage;
  let account: RTCAccount = null;
  let ua: MockUserAgent;
  function setupAccount() {
    if (account) {
      account.destroy();
      account = null;
    }
    mockListener = new MockAccountListener();
    localStorage = new MockLocalStorage();
    RTCDaoManager.instance().setDaoDelegate(localStorage);
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
    account.logout();
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

  it('Should return null when make call and new call is not allowed. [JPT-805]', done => {
    setupAccount();
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    account.makeCall('234', listener);
    setImmediate(() => {
      expect(mockListener.onMadeOutgoingCall).toBeCalledTimes(1);
      done();
    });
  });

  it('Should do nothing when receive incoming call and new call is not allowed. [JPT-809]', done => {
    setupAccount();
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
    setImmediate(() => {
      expect(mockListener.onMadeOutgoingCall).toBeCalledTimes(1);
      expect(mockListener.onReceiveIncomingCall).not.toBeCalled();
      done();
    });
  });

  it('Should call count set to 1 and return call when outbound call is allowed. [JPT-806]', done => {
    setupAccount();
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    setImmediate(() => {
      expect(mockListener.onMadeOutgoingCall).toBeCalledTimes(1);
      expect(account.callCount()).toBe(1);
      done();
    });
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
    const call = new RTCCall(false, '123', null, account, listener);
    account._callManager.addCall(call);
    call.hangup();
    setImmediate(() => {
      expect(account.callCount()).toBe(0);
      done();
    });
  });

  it('Should call count set to 0 when active call session disconnected. [JPT-808]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call = new RTCCall(false, '123', null, account, listener);
    const session = new MockSession();
    account._callManager.addCall(call);
    call.onAccountReady();
    call.setCallSession(session);
    session.emit('bye');
    setImmediate(() => {
      expect(account.callCount()).toBe(0);
      done();
    });
  });

  it('should call hangupAllCalls when account enter unReg state. [JPT-1010]', done => {
    setupAccount();
    jest.spyOn(account._callManager, 'endAllCalls');
    account.logout();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.UNREGISTERED,
      );
      expect(account._callManager.endAllCalls).toBeCalled();
      done();
    });
  });

  it('should clear provisioning info when account enter unreg state. [JPT-1011]', done => {
    setupAccount();
    localStorage.put(kProvisioningInfoKey, '1234');
    expect(localStorage.get(kProvisioningInfoKey)).not.toBe(null);
    jest.spyOn(account._provManager, 'clearProvInfo');
    account.logout();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.UNREGISTERED,
      );
      expect(account._provManager.clearProvInfo).toBeCalled();
      expect(account._provManager._sipProvisionInfo).toBe(null);
      expect(localStorage.get(kProvisioningInfoKey)).toBe(null);
      done();
    });
  });

  it('should call unreg API in webphone when account enter unreg state. [JPT-1012]', done => {
    setupAccount();
    account.logout();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.UNREGISTERED,
      );
      expect(ua.unregister).toBeCalled();
      done();
    });
  });

  it('should enter unreg state when call logout in failed state. [JPT-1013]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_FAILED);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.FAILURE,
      );
      account.logout();
      setImmediate(() => {
        expect(account._regManager._fsm.state).toBe(
          REGISTRATION_FSM_STATE.UNREGISTERED,
        );
        done();
      });
    });
  });

  it('should transition from regInProgress state to regFailure state when receive transportError event. [JPT-1174]', done => {
    setupAccount();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.IN_PROGRESS,
      );
      ua.emit(UA_EVENT.TRANSPORT_ERROR);
      setImmediate(() => {
        expect(account._regManager._fsm.state).toBe(
          REGISTRATION_FSM_STATE.FAILURE,
        );
        done();
      });
    });
  });

  it('should transition from Ready state to regFailure state when receive transportError event. [JPT-1175]', done => {
    setupAccount();
    ua.emit(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
      ua.emit(UA_EVENT.TRANSPORT_ERROR);
      setImmediate(() => {
        expect(account._regManager._fsm.state).toBe(
          REGISTRATION_FSM_STATE.FAILURE,
        );
        done();
      });
    });
  });

  it('Should parse multi-party conference headers for outbound call. [JPT-1051]', done => {
    setupAccount();
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    const session = new MockSession();
    const res = new MockResponse();
    setImmediate(() => {
      expect(mockListener.onMadeOutgoingCall).toBeCalled();
      expect(account.callList().length).toBe(1);
      const call = account.callList()[0];
      call.onAccountReady();
      call.setCallSession(session);
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

  it('should resend register and account enter in progress state when make call and account state is failed state. [JPT-1018]', done => {
    setupAccount();
    const listener = new MockCallListener();
    ua.emit(UA_EVENT.REG_FAILED);
    setImmediate(() => {
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.FAILED);
      account.makeCall('123', listener);
      setImmediate(() => {
        expect(ua.reRegister).toBeCalled();
        expect(account.state()).toBe(RTC_ACCOUNT_STATE.IN_PROGRESS);
        done();
      });
    });
  });

  it('should enter unreg state when call logout in ready state. [JPT-1014]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
      account.logout();
      setImmediate(() => {
        expect(account._regManager._fsm.state).toBe(
          REGISTRATION_FSM_STATE.UNREGISTERED,
        );
        done();
      });
    });
  });

  it('should enter unreg state when call logout in inprogress state. [JPT-1015]', done => {
    setupAccount();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.IN_PROGRESS,
      );
      account.logout();
      setImmediate(() => {
        expect(account._regManager._fsm.state).toBe(
          REGISTRATION_FSM_STATE.UNREGISTERED,
        );
        done();
      });
    });
  });

  it('should enter unreg state when call logout in idle state.', done => {
    if (account) {
      account.destroy();
      account = null;
    }
    mockListener = new MockAccountListener();
    account = new RTCAccount(mockListener);
    ua = new MockUserAgent();
    account._regManager._userAgent = ua;
    account._regManager._initUserAgentListener();
    expect(account._regManager._fsm.state).toBe(REGISTRATION_FSM_STATE.IDLE);
    account.logout();
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(
        REGISTRATION_FSM_STATE.UNREGISTERED,
      );
      done();
    });
  });

  describe('makeAnonymousCall()', () => {
    it('Should call createOutgoingCallSession api with options include anonymous when have been called without options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      account.makeAnonymousCall('123', listener);
      setImmediate(() => {
        expect(mockListener.onMadeOutgoingCall).toBeCalled();
        account._callManager.notifyAccountReady();
        setImmediate(() => {
          expect(account.createOutgoingCallSession).toHaveBeenCalledWith(
            '123',
            {
              fromNumber: kRTCAnonymous,
            },
          );
          expect(account.callList()[0].isAnonymous()).toBe(true);
          done();
        });
      });
    });

    it('Should call createOutgoingCallSession api with options include anonymous when have been called with options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const options: RTCCallOptions = { fromNumber: '234' };
      account.makeAnonymousCall('123', listener, options);
      setImmediate(() => {
        expect(mockListener.onMadeOutgoingCall).toBeCalled();
        account._callManager.notifyAccountReady();
        setImmediate(() => {
          expect(account.createOutgoingCallSession).toHaveBeenCalledWith(
            '123',
            {
              fromNumber: kRTCAnonymous,
            },
          );
          done();
        });
      });
    });
  });
});
