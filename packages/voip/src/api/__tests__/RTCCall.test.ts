/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-03 19:44:25
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallDelegate } from '../IRTCCallDelegate';
import { IRTCAccount } from '../../account/IRTCAccount';
import { RTCCall } from '../RTCCall';
import { CALL_FSM_NOTIFY } from '../../call/types';
import { RTC_CALL_STATE, RTC_CALL_ACTION } from '../types';

describe('RTC call', () => {
  class VirturlAccountAndCallObserver implements IRTCCallDelegate, IRTCAccount {
    public callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
    public callAction: RTC_CALL_STATE;
    public isReadyReturnValue: boolean = false;
    public toNum: string = '';

    onCallStateChange(state: RTC_CALL_STATE): void {
      this.callState = state;
    }

    onCallActionSuccess = jest.fn();
    onCallActionFailed = jest.fn();

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

    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();

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
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      expect(call.getCallInfo().uuid).not.toBe('');
    });
  });

  describe('setCallSession()', async () => {
    it('should call._callSession.setSession() is called when ues setCallSession()', async () => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      jest.spyOn(call._callSession, 'setSession');
      call.setCallSession(null);
      expect(call._callSession.setSession).toBeCalled();
    });
  });

  describe('flip()', async () => {
    it('should report flip success when FSM in connected state and flip success [JPT-682]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      call._fsm._fsmGoto('connected');
      session.flip.mockResolvedValue(null);
      call.flip(5);
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.FLIP,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.flip).toHaveBeenCalledWith(5);
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.FLIP,
        );
        done();
      });
    });

    it('should report flip failed when FSM in connected state but flip failed [JPT-683]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      call._fsm._fsmGoto('connected');
      session.flip.mockRejectedValue(null);
      call.flip(5);
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.FLIP,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.flip).toHaveBeenCalledWith(5);
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.FLIP,
        );
        done();
      });
    });

    describe('should report flip failed when FSM not in connected state [JPT-676]', async () => {
      it('should report flip failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call._fsm._fsmGoto('idle');
        call.flip(5);
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('idle');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });

      it('should report flip failed when FSM in pending state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call._fsm._fsmGoto('pending');
        call.flip(5);
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('pending');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });

      it('should report flip failed when FSM in connecting state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call._fsm._fsmGoto('connecting');
        call.flip(5);
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('connecting');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });

      it('should report flip failed when FSM in disconnected state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call._fsm._fsmGoto('disconnected');
        call.flip(5);
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });

      it('should report flip failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call._fsm._fsmGoto('answering');
        call.flip(5);
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });
    });
  });

  describe('startRecord()', async () => {
    it('should report startRecord success when FSM in connected state and startRecord success [JPT-686]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.START_RECORD,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.startRecord).toHaveBeenCalled();
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
        );
        done();
      });
    });

    it('should report startRecord success when FSM in connected state and is recording [JPT-685]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.START_RECORD,
      );
      call.startRecord();
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.startRecord).toHaveBeenCalledTimes(1);
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
        );
        done();
      });
    });

    it('should report startRecord failed when FSM in connected state but startRecord failed [JPT-687]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockRejectedValue(null);
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.START_RECORD,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.startRecord).toHaveBeenCalled();
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
        );
        done();
      });
    });

    describe('should report startRecord failed when FSM not in connected state [JPT-684]', async () => {
      it('should report startRecord failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('idle');
        call.startRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('idle');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in pending state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('pending');
        call.startRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('pending');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in connecting state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('connecting');
        call.startRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('connecting');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in disconnected state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('disconnected');
        call.startRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('answering');
        call.startRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });
    });
  });

  describe('stopRecord()', async () => {
    it('should report stopRecord success when FSM in connected state and stopRecord success [JPT-690]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockResolvedValue(null);
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.START_RECORD,
      );
      call.stopRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.STOP_RECORD,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.stopRecord).toHaveBeenCalled();
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
        );
        done();
      });
    });

    it('should report stopRecord success when FSM in connected state and is not recording [JPT-689]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.stopRecord.mockResolvedValue(null);
      call.stopRecord();
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(session.stopRecord).not.toHaveBeenCalled();
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
        );
        done();
      });
    });

    it('should report stopRecord failed when FSM in connected state but stopRecord failed [JPT-691]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      call._fsm._fsmGoto('connected');
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockRejectedValue(null);
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.START_RECORD,
      );
      call.stopRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.STOP_RECORD,
      );
      const fsmState = call._fsm.state();
      setImmediate(() => {
        expect(fsmState).toBe('connected');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
        );
        done();
      });
    });

    describe('should report stopRecord failed when FSM not in connected state [JPT-688]', async () => {
      it('should report stopRecord failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockRejectedValue(null);
        call._fsm._fsmGoto('idle');
        call._isRecording = true;
        call.stopRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('idle');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in pending state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('pending');
        call._isRecording = true;
        call.stopRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('pending');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in connecting state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('connecting');
        call._isRecording = true;
        call.stopRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('connecting');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in disconnected state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('disconnected');
        call._isRecording = true;
        call.stopRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._fsm._fsmGoto('answering');
        call._isRecording = true;
        call.stopRecord();
        const fsmState = call._fsm.state();
        setImmediate(() => {
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });
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
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutCallSession');
      account.isReadyReturnValue = false;
      const call = new RTCCall(false, '123', null, account, account);
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.createOutCallSession).not.toBeCalled();
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.createOutCallSession).not.toBeCalled();
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it('should state transition from Idle to Connecting when Account ready [JPT-602]', done => {
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutCallSession');
      account.isReadyReturnValue = true;
      const call = new RTCCall(false, '123', null, account, account);
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.toNum).toBe('123');
        expect(vAccount.createOutCallSession).toBeCalled();
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.toNum).toBe('123');
        expect(account.createOutCallSession).toBeCalled();
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });
  });

  describe('Pending state transitions', async () => {
    it("should state transition from Pending to Connecting when receive 'Account ready' event [JPT-603]", done => {
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutCallSession');
      const call = new RTCCall(false, '123', null, account, account);
      call.onAccountReady();
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(vAccount.toNum).toBe('123');
        expect(vAccount.createOutCallSession).toBeCalled();
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTCCALL_STATE.CONNECTING);
        expect(account.toNum).toBe('123');
        expect(account.createOutCallSession).toBeCalled();
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it("should state transition from Pending to Disconnected when receive 'Hang up' event [JPT-604]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      account.isReadyReturnValue = false;
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      jest.spyOn(session, 'terminate');
      call.hangup();
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(session.hangup).toBeCalled;
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });
  });

  describe('Connecting state transitions', async () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-605]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accepted');
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.CONNECTED);
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.CONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.CONNECTED);
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Hang up' event [JPT-606]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      jest.spyOn(session, 'terminate');
      call.onAccountReady();
      call.hangup();
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled();
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(session.hangup).toBeCalled();
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session disconnected' event [JPT-607]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('bye');
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session error' event [JPT-608]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('failed');
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });
  });

  describe('Connected state transitions', async () => {
    it("should state transition from Connected to Disconnected when receive 'Hang up' event [JPT-609]", done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      jest.spyOn(session, 'terminate');
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      call.hangup();
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(session.hangup).toBeCalled;
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });

    it("should state transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-610]", done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      session.mockSignal('bye');
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session error' event [JPT-611]", done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accept');
      session.mockSignal('failed');
      setImmediate(() => {
<<<<<<< HEAD:packages/voip/src/api/__tests__/RTCCall.test.ts
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(vAccount.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
=======
        expect(call.getCallState()).toBe(RTCCALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTCCALL_STATE.DISCONNECTED);
>>>>>>> feature/FIJI-2556:packages/voip/src/call/__tests__/RTCCall.test.ts
        done();
      });
    });
  });
});
