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
  RTCSipProvisionInfo,
} from '../types';
import {
  kRTCAnonymous,
  kRTCProvisioningOptions,
  kRTCProvRefreshByRegFailedInterval,
  kRetryIntervalList,
} from '../../account/constants';
import { REGISTRATION_FSM_STATE, RTC_PROV_EVENT } from '../../account/types';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { RTCNetworkNotificationCenter } from '../../utils/RTCNetworkNotificationCenter';
import { kProvisioningInfoKey } from '../../utils/constants';
import { ITelephonyDaoDelegate } from 'foundation/telephony';
import { RTCDaoManager } from '../../utils/RTCDaoManager';
import { RTCCall } from '../RTCCall';

const mockProvisionData = {
  device: { name: 'device' },
  sipInfo: [
    {
      transport: 'transport',
      password: 'password',
      domain: 'domain',
      username: 'userName',
      authorizationId: 'id',
      outboundProxy: 'proxy',
    },
  ],
  sipFlags: {
    voipFeatureEnabled: true,
    voipCountryBlocked: false,
    outboundCallsEnabled: true,
    dscpEnabled: true,
    dscpSignaling: 100,
    dscpVoice: 100,
    dscpVideo: 100,
  },
};

const mockProvisionData2 = {
  device: { name: 'device2' },
  sipInfo: [
    {
      transport: 'transport2',
      password: 'password2',
      domain: 'domain2',
      username: 'userName2',
      authorizationId: 'id2',
      outboundProxy: 'proxy2',
    },
  ],
  sipFlags: { flag: 'sipFlags2' },
};

class MockAccountListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
  onReceiveNewProvFlags = jest.fn();
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
  mockSignal(signal: any, response?: any, cause?: any) {
    this.emit(signal, response, cause);
  }
  makeCall(phoneNumber: string, options: RTCCallOptions): any {
    return new MockSession();
  }
  getStatusCode(): number {
    return 200;
  }
  unregister = jest.fn();
  reRegister = jest.fn();
  restartUA = jest.fn();
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

  dialog = {
    id: {
      callId: '100',
      remoteTag: '200',
      localTag: '300',
    },
  };
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
  account = new RTCAccount(mockListener, {
    endpointId: 'test',
    userAgent: 'test',
  });
  ua = new MockUserAgent();
  jest.spyOn(account._regManager._fsm, 'provisionReady');
  account._regManager._userAgent = ua;
  account._regManager._initUserAgentListener();
  account._onNewProv(mockProvisionData);
}

describe('Telephony HA', () => {
  it('Should follow back off algorithm for register retry interval[JPT-2304]', () => {
    setupAccount();
    let interval = 0;
    for (let i = 0; i < 20; i++) {
      interval = account._calculateNextRetryInterval();
      if (i < kRetryIntervalList.length) {
        expect(interval).toBeGreaterThanOrEqual(kRetryIntervalList[i].min);
        expect(interval).toBeLessThanOrEqual(kRetryIntervalList[i].max);
      } else {
        expect(interval).toBeGreaterThanOrEqual(1920);
        expect(interval).toBeLessThanOrEqual(3840);
      }
      account._failedTimes++;
    }
  });

  it('Should set postponeSwitchBackProxy to true when timer reached and receive switchBackProxy and has active call. [JPT-2306]', done => {
    setupAccount();
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    ua.mockSignal(UA_EVENT.SWITCH_BACK_PROXY);
    setImmediate(() => {
      expect(account.callCount()).toBe(1);
      expect(account._postponeReregister).toBe(true);
      done();
    });
  });

  it('Should reconnect to main proxy when timer reached and receive switchBackProxy and has no active call. [JPT-2307]', done => {
    setupAccount();
    jest.spyOn(account._regManager, 'reRegister');
    ua.mockSignal(UA_EVENT.SWITCH_BACK_PROXY);
    setImmediate(() => {
      expect(account._regManager.reRegister).toHaveBeenCalled();
      done();
    });
  });

  it('Should refresh SIP provision when receive provisionUpdate. [JPT-2308]', done => {
    setupAccount();
    jest.spyOn(account._provManager, 'refreshSipProv');
    ua.mockSignal(UA_EVENT.PROVISION_UPDATE);
    setImmediate(() => {
      expect(account._provManager.refreshSipProv).toHaveBeenCalled();
      done();
    });
  });

  it('Should send reRegister when retry timer reached. [JPT-812]', done => {
    jest.useFakeTimers();
    setupAccount();
    jest.spyOn(account._regManager, 'reRegister');
    ua.mockSignal(UA_EVENT.REG_FAILED);
    setImmediate(() => {
      jest.advanceTimersByTime(60 * 1000);
      expect(account._regManager.reRegister).toHaveBeenCalled();
      done();
    });
  });

  it('Should reconnect to main proxy when postponeSwitchBackProxy is true and active call end. [JPT-2309]', done => {
    setupAccount();
    jest.spyOn(account._regManager, 'reRegister');
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    ua.mockSignal(UA_EVENT.SWITCH_BACK_PROXY);
    setImmediate(() => {
      expect(account.callCount()).toBe(1);
      expect(account._postponeReregister).toBe(true);
      call.hangup();
      setImmediate(() => {
        expect(account.callCount()).toBe(0);
        expect(account._regManager.reRegister).toHaveBeenCalled();
        done();
      });
    });
  });

  it('Should do nothing when postponeSwitchBackProxy is false and active call end. [JPT-2310]', done => {
    setupAccount();
    jest.spyOn(account._regManager, 'reRegister');
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    setImmediate(() => {
      expect(account.callCount()).toBe(1);
      expect(account._postponeReregister).toBe(false);
      call.hangup();
      setImmediate(() => {
        expect(account.callCount()).toBe(0);
        expect(account._regManager.reRegister).not.toHaveBeenCalled();
        expect(account._postponeReregister).toBe(false);
        done();
      });
    });
  });
});

describe('RTCAccount', () => {
  it('Should  Report registered state to upper layer when account state transient to registered [JPT-528]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account._regManager._fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
      expect(account._failedTimes).toBe(0);
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
    const ret1 = account.makeCall('123', listener);
    setImmediate(() => {
      const ret2 = account.makeCall('234', listener);
      setImmediate(() => {
        expect(ret1).not.toBeUndefined();
        expect(ret2).toBeUndefined();
        done();
      });
    });
  });

  it('Should do nothing when receive incoming call and new call is not allowed. [JPT-809]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
    setImmediate(() => {
      expect(call).not.toBe(null);
      expect(mockListener.onReceiveIncomingCall).not.toHaveBeenCalled();
      done();
    });
  });

  it('Should call count set to 1 and return call when outbound call is allowed. [JPT-806]', done => {
    setupAccount();
    const listener = new MockCallListener();
    const call = account.makeCall('123', listener);
    setImmediate(() => {
      expect(call).not.toBe(null);
      expect(account.callCount()).toBe(1);
      done();
    });
  });

  it('Should call count set to 1 and return call when receive incoming call and new call is allowed. [JPT-810]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
      expect(account.callCount()).toBe(1);
      expect(mockListener.onReceiveIncomingCall).toHaveBeenCalled();
      done();
    });
  });

  it('Should parse multi-party conference headers for incoming call. [JPT-1050]', done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      ua.emit(UA_EVENT.RECEIVE_INVITE, new MockSession());
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
      expect(account._callManager.endAllCalls).toHaveBeenCalled();
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
      expect(account._provManager.clearProvInfo).toHaveBeenCalled();
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
      setImmediate(() => {
        expect(ua.unregister).toHaveBeenCalled();
        done();
      });
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
    const call = account.makeCall('123', listener);
    const session = new MockSession();
    const res = new MockResponse();
    setImmediate(() => {
      expect(call).not.toBe(null);
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
        expect(ua.reRegister).toHaveBeenCalled();
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

  it('Should postpone provisioning info when receive new provisioning event from Provision manager during call. [JPT-1202]', done => {
    setupAccount();
    account.clearLocalProvisioning();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    const listener = new MockCallListener();
    account.makeCall('123', listener);
    setImmediate(() => {
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.REGISTERED);
      expect(account.callCount()).toBe(1);
      expect(account._postponeProvisioning).not.toBeDefined();
      account._onNewProv(mockProvisionData2);
      expect(account._postponeProvisioning).toBe(mockProvisionData2);
      done();
    });
  });

  it('Should send new provisioning event in Account FSM when receive new provisioning event from Provision manager without call. [JPT-1203]', done => {
    setupAccount();
    account.clearLocalProvisioning();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.REGISTERED);
      expect(account.callCount()).toBe(0);
      account._onNewProv(mockProvisionData2);
      setImmediate(() => {
        expect(account._regManager._fsm.provisionReady).toHaveBeenCalledWith(
          mockProvisionData2,
          kRTCProvisioningOptions,
        );
        done();
      });
    });
  });

  it("Should send new provisioning event in Account FSM when call end & there's postponed provisioning info. [JPT-1204]", done => {
    setupAccount();
    account.clearLocalProvisioning();
    const listener = new MockCallListener();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(account._regManager._fsm.provisionReady).toHaveBeenCalledWith(
        mockProvisionData,
        kRTCProvisioningOptions,
      );
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.REGISTERED);
      expect(account.callCount()).toBe(0);
      account.makeCall('123', listener);
      setImmediate(() => {
        expect(account.callCount()).toBe(1);
        expect(account._postponeProvisioning).not.toBeDefined();
        account._onNewProv(mockProvisionData2);
        expect(account._postponeProvisioning).toBe(mockProvisionData2);
        account._callManager.callList()[0].hangup();
        setImmediate(() => {
          expect(account.callCount()).toBe(0);
          setImmediate(() => {
            expect(
              account._regManager._fsm.provisionReady,
            ).toHaveBeenCalledWith(mockProvisionData2, kRTCProvisioningOptions);
            done();
          });
        });
      });
    });
  });

  it("Should do nothing when Account FSM doesn't trigger NewProvAction after send new provisioning event in Account FSM. [JPT-1205]", done => {
    setupAccount();
    ua.mockSignal(UA_EVENT.REG_SUCCESS);
    setImmediate(() => {
      expect(ua.restartUA).toHaveBeenCalledTimes(1);
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.REGISTERED);
      account.logout();
      setImmediate(() => {
        expect(account.state()).toBe(RTC_ACCOUNT_STATE.UNREGISTERED);
        account._onNewProv(mockProvisionData2);
        setImmediate(() => {
          expect(account.state()).toBe(RTC_ACCOUNT_STATE.UNREGISTERED);
          expect(ua.restartUA).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });

  it('Should restart UserAgent when Account FSM trigger NewProvAction after send new provisioning event in Account FSM. [JPT-1206]', done => {
    setupAccount();
    account._onNewProv({});
    setImmediate(() => {
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.IN_PROGRESS);
      expect(ua.restartUA).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it("should create call object and call state changes to 'pending' when make call in account idle state. [JPT-1404]", done => {
    const mockListener = new MockAccountListener();
    const callListener = new MockCallListener();
    const account = new RTCAccount(mockListener);
    const ret = account.makeCall('123', callListener);
    setImmediate(() => {
      expect(account.state()).toBe(RTC_ACCOUNT_STATE.IDLE);
      expect(ret).not.toBe(null);
      expect(account.callCount()).toBe(1);
      setImmediate(() => {
        expect(account.callList()[0]._fsm.state()).toBe('pending');
        done();
      });
    });
  });

  describe('makeAnonymousCall()', () => {
    it('Should call createOutgoingCallSession api with options include anonymous when have been called without options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      const options: RTCCallOptions = {};
      options.fromNumber = kRTCAnonymous;
      jest.spyOn(account, 'createOutgoingCallSession');
      const call = account.makeCall('123', listener, options);
      setImmediate(() => {
        expect(call).not.toBe(null);
        account._callManager.notifyAccountReady();
        setImmediate(() => {
          expect(account.createOutgoingCallSession).toHaveBeenCalledWith(
            '123',
            {
              fromNumber: kRTCAnonymous,
            },
          );
          expect(call.isAnonymous()).toBe(true);
          done();
        });
      });
    });

    it('Should call createOutgoingCallSession api with options include anonymous when have been called with options param [JPT-976]', done => {
      setupAccount();
      const listener = new MockCallListener();
      jest.spyOn(account, 'createOutgoingCallSession');
      const options: RTCCallOptions = { fromNumber: '234' };
      options.fromNumber = kRTCAnonymous;
      const call = account.makeCall('123', listener, options);
      setImmediate(() => {
        expect(call).not.toBe(null);
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

  describe('get new sip flags', () => {
    it('Should notify delegate with voipCountryBlocked and voipFeatureEnabled when get new sip provision [JPT-1313]', () => {
      setupAccount();
      account._provManager.emit(RTC_PROV_EVENT.NEW_PROV, {
        info: mockProvisionData,
      });
      expect(mockListener.onReceiveNewProvFlags).toHaveBeenCalledWith(
        mockProvisionData.sipFlags,
      );
    });

    it('Should return voipCountryBlocked and voipFeatureEnabled when call getSipFlags api and has Sip provision [JPT-1314]', () => {
      setupAccount();
      account._provManager._sipProvisionInfo = mockProvisionData;
      const expectSipFlags = account.getSipProvFlags();
      expect(expectSipFlags).toEqual(mockProvisionData.sipFlags);
    });

    it('Should return null when call getSipFlags api and but no Sip provision [JPT-1315]', () => {
      setupAccount();
      const expectSipFlags = account.getSipProvFlags();
      expect(expectSipFlags).toBeNull();
    });
  });

  describe('get sip prov', () => {
    it('should return sip prov', () => {
      setupAccount();
      account._provManager._sipProvisionInfo = mockProvisionData;
      const expectSipFlags = account.getSipProv();
      expect(expectSipFlags).toEqual(mockProvisionData);
    });
  });

  describe('refreshProv', () => {
    const cause = 'connection error';
    const response = { statusCode: 401 };
    it('Should not call refreshProv api if error code is not 401/403/407 when register failed [JPT-1182]', done => {
      setupAccount();
      jest.spyOn(account, '_refreshProv');
      ua.mockSignal(UA_EVENT.REG_FAILED, { statusCode: 402 }, cause);
      setImmediate(() => {
        expect(account._refreshProv).not.toHaveBeenCalled();
        done();
      });
    });

    it('Should refresh sip provisioning, set _isRefreshedWithinTime true and set timer 1h if _isRefreshedWithinTime is false when register failed with 401/403/407 [JPT-1184]', done => {
      setupAccount();
      jest.spyOn(account, '_refreshProv');
      jest.spyOn(account._provManager, '_sendSipProvRequest');
      expect(account._provManager._isRefreshedWithinTime).not.toBeTruthy();
      ua.mockSignal(UA_EVENT.REG_FAILED, response, cause);
      setImmediate(() => {
        expect(account._refreshProv).toHaveBeenCalled();
        expect(account._provManager._isRefreshedWithinTime).toBeTruthy();
        expect(account._provManager._refreshByRegFailedTimer).not.toBeNull();
        expect(account._provManager._sendSipProvRequest).toHaveBeenCalled();
        done();
      });
    });

    it('Should set _isAcquireProvWhenTimeArrived true if _isRefreshedWithinTime is true when register failed with 401/403/407 [JPT-1183]', done => {
      setupAccount();
      jest.spyOn(account._provManager, '_sendSipProvRequest');
      account._provManager._isRefreshedWithinTime = true;
      ua.mockSignal(UA_EVENT.REG_FAILED, response, cause);
      setImmediate(() => {
        expect(account._provManager._isRefreshedWithinTime).toBeTruthy();
        expect(account._provManager._refreshByRegFailedTimer).toBeNull();
        expect(account._provManager._sendSipProvRequest).not.toHaveBeenCalled();
        expect(account._provManager._isAcquireProvWhenTimeArrived).toBeTruthy();
        done();
      });
    });

    it('Should set _isRefreshedWithinTime to false if _isAcquireProvWhenTimeArrived is false when timer arrived [JPT-1185]', done => {
      jest.useFakeTimers();
      setupAccount();
      jest.spyOn(account, '_refreshProv');
      jest.spyOn(account._provManager, '_sendSipProvRequest');
      account._provManager._isRefreshedWithinTime = true;
      account._provManager._isAcquireProvWhenTimeArrived = false;
      account._provManager._setRefreshByRegFailedTimer();
      setImmediate(() => {
        jest.advanceTimersByTime(kRTCProvRefreshByRegFailedInterval * 1000);
        expect(account._provManager._isRefreshedWithinTime).not.toBeTruthy();
        expect(account._provManager._sendSipProvRequest).not.toHaveBeenCalled();
        done();
      });
    });

    it('Should request sip provisioning, set _isAcquireProvWhenTimeArrived false and set timer if _isAcquireProvWhenTimeArrived is true when timer arrived [JPT-1186]', done => {
      jest.useFakeTimers();
      setupAccount();
      jest.spyOn(account, '_refreshProv');
      account._provManager._sendSipProvRequest = jest
        .fn()
        .mockResolvedValue(null);
      account._provManager._isRefreshedWithinTime = true;
      account._provManager._isAcquireProvWhenTimeArrived = true;
      account._provManager._setRefreshByRegFailedTimer();
      setImmediate(() => {
        jest.advanceTimersByTime(kRTCProvRefreshByRegFailedInterval * 1000);
        expect(account._provManager._isRefreshedWithinTime).toBeTruthy();
        expect(
          account._provManager._isAcquireProvWhenTimeArrived,
        ).not.toBeTruthy();
        expect(account._provManager._sendSipProvRequest).toHaveBeenCalled();
        done();
      });
    });

    it('Should set _isAcquireProvWhenTimeArrived false, set _isRefreshedWithinTime false and clear timer when registration FSM state enter ready after register failed with 401/403/407 [JPT-1187]', done => {
      setupAccount();
      jest.spyOn(account, '_refreshProv');
      jest.spyOn(account._provManager, '_sendSipProvRequest');
      ua.mockSignal(UA_EVENT.REG_FAILED, response, cause);
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      setImmediate(() => {
        expect(account._refreshProv).toHaveBeenCalled();
        expect(account._provManager._isRefreshedWithinTime).not.toBeTruthy();
        expect(
          account._provManager._isAcquireProvWhenTimeArrived,
        ).not.toBeTruthy();
        expect(account._provManager._refreshByRegFailedTimer).toBeNull();
        expect(account._provManager._sendSipProvRequest).toHaveBeenCalled();
        done();
      });
    });
  });
});
