/// <reference path="../../__tests__/types.d.ts" />
import { IRTCCallObserver } from '../IRTCCallObserver';
import { CALL_SESSION_STATE } from '../IRTCCallSession';
import { IRTCAccount } from '../../account/IRTCAccount';
import { RTCCall } from '../RTCCall';
import { RTCCALL_STATE } from '../types';
import { async } from 'q';
import { any } from 'prop-types';
import { addLeadingSlash } from 'history/PathUtils';

describe('RTC call', () => {
  class VirturlAccountAndCallObserver implements IRTCCallObserver, IRTCAccount {
    public callState: RTCCALL_STATE = RTCCALL_STATE.IDLE;

    public isReadyReturnValue: boolean = false;

    public toNum: string = '';

    onCallStateChange(state: RTCCALL_STATE): void {
      this.callState = state;
    }

    isReady(): boolean {
      return this.isReadyReturnValue;
    }
    createOutCallSession(toNum: string): void {
      this.toNum = toNum;
    }
  }

  describe('constructor()', async () => {
    it('should set UUID when use constructor() ', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      expect(call._callInfo.uuid).not.toBe('');
    });
  });

  describe('setCallSession()', async () => {
    it('should call._callSession.setSession() is called when ues setCallSession() ', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      jest.spyOn(call._callSession, 'setSession');
      call.setCallSession(null);
      expect(call._callSession.setSession).toBeCalled();
    });
  });

  describe('Idle state transitions', async () => {
    // it('should state transition from Idle to Pending when account not ready [JPT-601]', done => {
    //   const vAccount = new VirturlAccountAndCallObserver();
    //   jest.spyOn(vAccount, 'createOutCallSession');
    //   vAccount.isReadyReturnValue = false;
    //   const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
    //   setImmediate(() => {
    //     expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
    //     expect(vAccount.callState).toBe(RTCCALL_STATE.CONNECTING);
    //     expect(vAccount.createOutCallSession).not.toBeCalled();
    //     done();
    //   });
    // });

    it('should state transition from Idle to Connecting when Account ready [JPT-602]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      vAccount.isReadyReturnValue = true;
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTCCALL_STATE.CONNECTING);
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
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('pending');
      call.onAccountReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTCCALL_STATE.CONNECTING);
        expect(vAccount.toNum).toBe('123');
        expect(vAccount.createOutCallSession).toBeCalled();
        done();
      });
    });

    it("should state transition from Pending to Disconnected when receive 'Hang up' event [JPT-604]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      vAccount.isReadyReturnValue = false;
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      jest.spyOn(call._callSession, 'hangup');
      call._fsm._fsmGoto('pending');
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(call._callSession.hangup).toBeCalled;
        done();
      });
    });
  });

  describe('Connecting state transitions', async () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-605]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connecting');
      call._callSession.emit(CALL_SESSION_STATE.CONFIRMED);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.CONNECTED);
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Hang up' event [JPT-606]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      jest.spyOn(call._callSession, 'hangup');
      call._fsm._fsmGoto('connecting');
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(call._callSession.hangup).toBeCalled();
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session disconnected' event [JPT-607]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connecting');
      call._callSession.emit(CALL_SESSION_STATE.DISCONNECTED);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session error' event [JPT-608]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connecting');
      call._callSession.emit(CALL_SESSION_STATE.ERROR);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        done();
      });
    });
  });

  describe('Connected state transitions', async () => {
    it("should state transition from Connected to Disconnected when receive 'Hang up' event [JPT-609]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      jest.spyOn(call._callSession, 'hangup');
      call._fsm._fsmGoto('connected');
      call.hangup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(call._callSession.hangup).toBeCalled;
        done();
      });
    });

    it("should state transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-610]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      call._callSession.emit(CALL_SESSION_STATE.DISCONNECTED);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session error' event [JPT-611]", done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = RTCCall.createOutgoingCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      call._callSession.emit(CALL_SESSION_STATE.ERROR);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        done();
      });
    });
  });
});
