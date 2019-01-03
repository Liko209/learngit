/// <reference path="../../__tests__/types.d.ts" />
import { IRTCCallObserver } from '../IRTCCallObserver';
import { CALL_SESSION_STATE } from '../IRTCCallSession';
import { IRTCAccount } from '../../account/IRTCAccount';
import { RTCCall } from '../RTCCall';
import { RTCCALL_STATE, RTCCALL_ACTION } from '../types';
import { EventEmitter2 } from 'eventemitter2';
import { async } from 'q';
import { any } from 'prop-types';
import { addLeadingSlash } from 'history/PathUtils';

describe('RTC call', () => {
  class VirturlAccountAndCallObserver implements IRTCCallObserver, IRTCAccount {
    public callState: RTCCALL_STATE = RTCCALL_STATE.IDLE;
    public callAction: RTCCALL_ACTION;

    public isReadyReturnValue: boolean = false;

    public toNum: string = '';

    onCallStateChange(state: RTCCALL_STATE): void {
      this.callState = state;
    }

    onCallAction = jest.fn();

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
    }

    flip = jest.fn();

    startRecord = jest.fn();

    stopRecord = jest.fn();
  }

  describe('constructor()', async () => {
    it('should set uudi when ues constructor() ', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      expect(call._callInfo.uuid).not.toBe('');
    });
  });

  describe('setCallSession()', async () => {
    it('should call._callSession.setSession() is called when ues setCallSession() ', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      jest.spyOn(call._callSession, 'setSession');
      call.setCallSession(null);
      expect(call._callSession.setSession).toBeCalled();
    });
  });

  describe('flip()', async () => {
    it('should report flip success when FSM in connected state and flip success [JPT-682]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.flip.mockResolvedValue(null);
      call.flip(5);
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.FLIP_SUCCESS,
        );
        done();
      });
    });

    it('should report flip failed when FSM in connected state but flip failed [JPT-683]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.flip.mockRejectedValue(null);
      call.flip(5);
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.FLIP_FAILED,
        );
        done();
      });
    });

    describe('should report flip failed when FSM not in connected state [JPT-676]', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      const session = new MockSession();
      call._callSession.setSession(session);
      session.flip.mockResolvedValue(null);

      it('should report flip failed when FSM in idle state', done => {
        call._fsm._fsmGoto('idle');
        call.flip(5);
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.FLIP_FAILED,
          );
          done();
        });
      });

      it('should report flip failed when FSM in pending state', done => {
        call._fsm._fsmGoto('pending');
        call.flip(5);
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.FLIP_FAILED,
          );
          done();
        });
      });

      it('should report flip failed when FSM in connecting state', done => {
        call._fsm._fsmGoto('connecting');
        call.flip(5);
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.FLIP_FAILED,
          );
          done();
        });
      });

      it('should report flip failed when FSM in disconnected state', done => {
        call._fsm._fsmGoto('disconnected');
        call.flip(5);
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.FLIP_FAILED,
          );
          done();
        });
      });
    });
  });

  describe('startRecord()', async () => {
    it('should report startRecord success when FSM in connected state and startRecord success [JPT-686]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockResolvedValue(null);
      call.startRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.START_RECORD_SUCCESS,
        );
        done();
      });
    });

    it('should report startRecord success when FSM in connected state and is recording [JPT-685]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockResolvedValue(null);
      call.startRecord();
      call.startRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledTimes(2);
        expect(vAccount.onCallAction).toHaveBeenLastCalledWith(
          RTCCALL_ACTION.START_RECORD_SUCCESS,
        );
        done();
      });
    });

    it('should report startRecord failed when FSM in connected state but startRecord failed [JPT-687]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockRejectedValue(null);
      call.startRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.START_RECORD_FAILED,
        );
        done();
      });
    });

    describe('should report startRecord failed when FSM not in connected state [JPT-684]', async () => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockResolvedValue(null);

      it('should report startRecord failed when FSM in idle state', done => {
        call._fsm._fsmGoto('idle');
        call.startRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.START_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in pending state', done => {
        call._fsm._fsmGoto('pending');
        call.startRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.START_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in connecting state', done => {
        call._fsm._fsmGoto('connecting');
        call.startRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.START_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in disconnected state', done => {
        call._fsm._fsmGoto('disconnected');
        call.startRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.START_RECORD_FAILED,
          );
          done();
        });
      });
    });
  });

  describe('stopRecord()', async () => {
    it('should report stopRecord success when FSM in connected state and stopRecord success [JPT-690]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockResolvedValue(null);
      call.startRecord();
      call.stopRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.STOP_RECORD_SUCCESS,
        );
        done();
      });
    });

    it('should report stopRecord success when FSM in connected state and is not recording [JPT-689]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.stopRecord.mockResolvedValue(null);
      call.stopRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.STOP_RECORD_SUCCESS,
        );
        done();
      });
    });

    it('should report stopRecord failed when FSM in connected state but stopRecord failed [JPT-691]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      const call = new RTCCall('123', vAccount, vAccount);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call._callSession.setSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockRejectedValue(null);
      call.startRecord();
      call.stopRecord();
      setImmediate(() => {
        expect(vAccount.onCallAction).toHaveBeenCalledTimes(2);
        expect(vAccount.onCallAction).toHaveBeenCalledWith(
          RTCCALL_ACTION.STOP_RECORD_FAILED,
        );
        done();
      });
    });

    describe('should report stopRecord failed when FSM not in connected state [JPT-688]', async () => {
      it('should report stopRecord failed when FSM in idle state', done => {
        const vAccount = new VirturlAccountAndCallObserver();
        const call = new RTCCall('123', vAccount, vAccount);
        const session = new MockSession();
        call._callSession.setSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('idle');
        call.stopRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.STOP_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in pending state', done => {
        const vAccount = new VirturlAccountAndCallObserver();
        const call = new RTCCall('123', vAccount, vAccount);
        const session = new MockSession();
        call._callSession.setSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('pending');
        call.stopRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.STOP_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in connecting state', done => {
        const vAccount = new VirturlAccountAndCallObserver();
        const call = new RTCCall('123', vAccount, vAccount);
        const session = new MockSession();
        call._callSession.setSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('connecting');
        call.stopRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.STOP_RECORD_FAILED,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in disconnected state', done => {
        const vAccount = new VirturlAccountAndCallObserver();
        const call = new RTCCall('123', vAccount, vAccount);
        const session = new MockSession();
        call._callSession.setSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('disconnected');
        call.stopRecord();
        setImmediate(() => {
          expect(vAccount.onCallAction).toHaveBeenCalledWith(
            RTCCALL_ACTION.STOP_RECORD_FAILED,
          );
          done();
        });
      });
    });
  });

  describe('Idle state transitions', async () => {
    it('should state transition from Idle to Pending when account not ready [JPT-601]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      vAccount.isReadyReturnValue = false;
      const call = new RTCCall('123', vAccount, vAccount);
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTCCALL_STATE.CONNECTING);
        expect(vAccount.createOutCallSession).not.toBeCalled();
        done();
      });
    });

    it('should state transition from Idle to Connecting when Account ready [JPT-602]', done => {
      const vAccount = new VirturlAccountAndCallObserver();
      jest.spyOn(vAccount, 'createOutCallSession');
      vAccount.isReadyReturnValue = true;
      const call = new RTCCall('123', vAccount, vAccount);
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
      const call = new RTCCall('123', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
      const call = new RTCCall('', vAccount, vAccount);
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
