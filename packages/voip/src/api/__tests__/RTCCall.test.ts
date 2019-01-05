/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-03 19:44:25
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { IRTCAccount } from '../../account/IRTCAccount';
import { RTCCall } from '../RTCCall';
import { RTC_CALL_STATE } from '../types';

describe('RTC call', () => {
  class VirturlAccountAndCallObserver implements IRTCCallDelegate, IRTCAccount {
    public callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;

    public isReadyReturnValue: boolean = false;

    public toNum: string = '';

    onCallStateChange(state: RTC_CALL_STATE): void {
      this.callState = state;
    }

    isReady(): boolean {
      return this.isReadyReturnValue;
    }
    createOutCallSession(toNum: string): void {
      this.toNum = toNum;
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
    mockSignal(signal: string): void {
      this.emit(signal);
    }
    terminate() {}
    accept() {}
    reject() {}
    toVoicemail() {}
    public remoteIdentity: any;
  }

  describe('constructor()', async () => {
    it('should set UUID when use constructor() ', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      expect(call.getCallInfo().uuid).not.toBe('');
    });
  });

  describe('setCallSession()', async () => {
    it('should call._callSession.setSession() is called when ues setCallSession()', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      jest.spyOn(call._callSession, 'setSession');
      call.setCallSession(null);
      expect(call._callSession.setSession).toBeCalled();
    });
  });

  describe('Incoming call', () => {
    it('should isIncomingCall() return true for incoming call', () => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      expect(call.isIncomingCall()).toBe(true);
    });

    it('should isIncomingCall() return false for outgoing call', () => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      expect(call.isIncomingCall()).toBe(false);
    });

    it('should call state become disconnected when reject call in idle state [JPT-623]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      jest.spyOn(session, 'reject');
      call.reject();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.reject).toBeCalled();
        done();
      });
    });

    it('should call state become disconnected when send to voicemail in idle state [JPT-624]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      jest.spyOn(session, 'toVoicemail');
      call.sendToVoicemail();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.toVoicemail).toBeCalled();
        done();
      });
    });
    it('should call state become disconnected when receive session disconnected in idle state [JPT-614]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      session.mockSignal('bye');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
    it('should call state become connecting when answer in idle state [JPT-625]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      jest.spyOn(session, 'accept');
      call.answer();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(session.accept).toBeCalled();
        done();
      });
    });
    it('should call state become connected when received session confirmed in answering state  [JPT-626]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      session.mockSignal('accepted');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        done();
      });
    });
    it('should call state become disconnected when receive session error in answering state [JPT-732]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      session.mockSignal('failed');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
    it('should call state become disconnected when receive session failed in answering state [JPT-627]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      session.mockSignal('failed');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
    it('should call state become disconnected when hangup in answering state [JPT-628]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      jest.spyOn(session, 'terminate');
      call.answer();
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled();
        done();
      });
    });
    it('should call state become disconnected when receive session disconnected in answering state [JPT-655]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      session.mockSignal('bye');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
  });

  describe('Idle state transitions', async () => {
    it('should state transition from Idle to Pending when account not ready [JPT-601]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      vAccount.isReadyReturnValue = false;
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.createOutCallSession).not.toBeCalled();
        done();
      });
    });

    it('should state transition from Idle to Connecting when Account ready [JPT-602]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      vAccount.isReadyReturnValue = true;
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.toNum).toBe('123');
        expect(vAccount.createOutCallSession).toBeCalled();
        done();
      });
    });
  });

  describe('Pending state transitions', async () => {
    it("should state transition from Pending to Connecting when receive 'Account ready' event [JPT-603]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.onAccountReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.toNum).toBe('123');
        expect(vAccount.createOutCallSession).toBeCalled();
        done();
      });
    });

    it("should state transition from Pending to Disconnected when receive 'Hang up' event [JPT-604]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      vAccount.isReadyReturnValue = false;
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.setCallSession(session);
      jest.spyOn(session, 'terminate');
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
        done();
      });
    });
  });

  describe('Connecting state transitions', async () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-605]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accepted');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTED);
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Hang up' event [JPT-606]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.setCallSession(session);
      jest.spyOn(session, 'terminate');
      call.onAccountReady();
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled();
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session disconnected' event [JPT-607]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('bye');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session error' event [JPT-608]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('failed');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
  });

  describe('Connected state transitions', async () => {
    it("should state transition from Connected to Disconnected when receive 'Hang up' event [JPT-609]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      const session = new MockSession();
      jest.spyOn(session, 'terminate');
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
        done();
      });
    });

    it("should state transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-610]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      const session = new MockSession();
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      session.mockSignal('bye');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session error' event [JPT-611]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, vAccount, vAccount);
      const session = new MockSession();
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      session.mockSignal('failed');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
  });
});
