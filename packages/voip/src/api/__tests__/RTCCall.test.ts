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
import {
  RTC_CALL_STATE,
  RTC_CALL_ACTION,
  RTCCallOptions,
  RTC_REPLY_MSG_PATTERN,
} from '../types';
import { WEBPHONE_SESSION_STATE } from '../../signaling/types';
import { kRTCHangupInvalidCallInterval } from '../../account/constants';
import { rtcLogger } from '../../utils/RTCLoggerProxy';
import { RTCMediaDeviceManager } from '../../api/RTCMediaDeviceManager';

describe('RTC call', () => {
  afterEach(() => {
    RTCMediaDeviceManager.instance().removeAllListeners();
  });

  class VirturlAccountAndCallObserver implements IRTCCallDelegate, IRTCAccount {
    createOutgoingCallSession(toNum: string): void {
      this.toNum = toNum;
    }
    removeCallFromCallManager(uuid: string): void {}
    public callState: RTC_CALL_STATE = RTC_CALL_STATE.IDLE;
    public callAction: RTC_CALL_ACTION;
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

  class SessionDescriptionHandler extends EventEmitter2 {
    private _directionFlag: boolean = true;
    constructor() {
      super();
    }

    setDirectionFlag(flag: boolean) {
      this._directionFlag = flag;
    }

    getDirection(): string {
      if (this._directionFlag) {
        return 'sendonly';
      }
      return 'sendrecv';
    }
  }

  class MediaStreams extends EventEmitter2 {
    public onMediaConnectionStateChange: any;

    constructor(session: any) {
      super();
    }

    public reconnectMedia(options: any) {}

    getMediaStats(callback: any, interval: any) {}

    stopMediaStats() {}

    release() {}
  }

  class MockSession extends EventEmitter2 {
    public sessionDescriptionHandler: SessionDescriptionHandler;
    public remoteIdentity: any;
    public mediaStreams: MediaStreams;
    constructor() {
      super();
      this.remoteIdentity = {
        displayName: 'test',
        uri: { aor: 'test@ringcentral.com' },
      };
      this.mediaStreams = new MediaStreams(this);
      this.sessionDescriptionHandler = new SessionDescriptionHandler();
    }

    emitSessionReinviteAccepted() {
      this.emit(WEBPHONE_SESSION_STATE.REINVITE_ACCEPTED, this);
    }

    emitSessionReinviteFailed() {
      this.emit(WEBPHONE_SESSION_STATE.REINVITE_FAILED, this);
    }

    request: MockRequest = new MockRequest();
    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();
    transfer = jest.fn();
    mute = jest.fn();
    unmute = jest.fn();
    park = jest.fn();

    hold = jest.fn();
    unhold = jest.fn();
    dtmf = jest.fn();
    forward = jest.fn();
    sendSessionMessage = jest.fn();
    replyWithMessage = jest.fn();
    terminate = jest.fn();
    accept = jest.fn();
    reject = jest.fn();
    toVoicemail = jest.fn();

    mockSignal(signal: string, response?: any): void {
      this.emit(signal, response);
    }
  }

  describe('constructor()', () => {
    it('should set UUID when use constructor() ', async () => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      expect(call.getCallInfo().uuid).not.toBe('');
    });
  });

  describe('setCallSession()', () => {
    it('should call._callSession.setSession() is called when ues setCallSession()', async () => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      jest.spyOn(call._callSession, 'setSession');
      call.setCallSession(null);
      expect(call._callSession.setSession).toBeCalled();
    });
  });

  describe('flip()', () => {
    it('should report flip success when FSM in connected state and flip success [JPT-682]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.flip.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.flip(5);
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.FLIP,
      );
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(session.flip).toHaveBeenCalledWith(5);
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.FLIP,
          {},
        );
        done();
      });
    });

    it('should report flip failed when FSM in connected state but flip failed [JPT-683]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.flip.mockRejectedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.flip(5);
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.FLIP,
      );
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(session.flip).toHaveBeenCalledWith(5);
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.FLIP,
        );
        done();
      });
    });

    describe('should report flip failed when FSM not in connected state [JPT-676]', () => {
      it('should report flip failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const call = new RTCCall(false, '123', null, account, account);
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
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
        call.onAccountNotReady();
        const session = new MockSession();
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call.flip(5);
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.onAccountReady();
        call.flip(5);
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.hangup();
        call.flip(5);
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });

      it('should report flip failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const session = new MockSession();
        const call = new RTCCall(true, '', session, account, account);
        call.setCallSession(session);
        session.flip.mockResolvedValue(null);
        call.answer();
        call.flip(5);
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FLIP,
          );
          done();
        });
      });
    });
  });

  describe('startRecord()', () => {
    it('should report startRecord success when FSM in connected state and startRecord success [JPT-686]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(call._isRecording).toBeTruthy;
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.START_RECORD,
        );
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
          {},
        );
        done();
      });
    });

    it('should report startRecord success when FSM in connected state and is recording [JPT-685]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.START_RECORD,
      );
      call.startRecord();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(call._isRecording).toBeTruthy;
        expect(session.startRecord).not.toHaveBeenCalled();
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.START_RECORD,
        );
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
          {},
        );
        done();
      });
    });

    it('should report startRecord failed when FSM in connected state and previous startRecord is in progress', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      jest.spyOn(call._callSession, 'startRecord').mockImplementation(() => {});
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._recordState).toBe('startRecordInProgress');
        call.startRecord();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          expect(call._recordState).toBe('startRecordInProgress');
          expect(account.onCallActionFailed).toBeCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });
    });

    it('should report startRecord failed when FSM in connected state and previous stopRecord is in progress', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      jest.spyOn(call._callSession, 'stopRecord').mockImplementation(() => {});
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._recordState).toBe('startRecordInProgress');
        call.stopRecord();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          expect(call._recordState).toBe('stopRecordInProgress');
          call.startRecord();
          setImmediate(() => {
            expect(call._fsm.state()).toBe('connected');
            expect(call._recordState).toBe('stopRecordInProgress');
            expect(account.onCallActionFailed).toBeCalledWith(
              RTC_CALL_ACTION.START_RECORD,
            );
            done();
          });
        });
      });
    });

    it('should report stopRecord failed when FSM in connected state and previous start record is in progress', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      jest.spyOn(call._callSession, 'startRecord').mockImplementation(() => {});
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._recordState).toBe('startRecordInProgress');
        call.stopRecord();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          expect(call._recordState).toBe('startRecordInProgress');
          expect(account.onCallActionFailed).toBeCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });
    });

    it.skip('should report stopRecord failed when FSM in connected state and previous stop record is in progress', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      jest.spyOn(call._callSession, 'stopRecord').mockImplementation(() => {});
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._recordState).toBe('startRecordInProgress');
        call.stopRecord();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          expect(call._recordState).toBe('stopRecordInProgress');
          call.stopRecord();
          setImmediate(() => {
            expect(call._fsm.state()).toBe('connected');
            expect(call._recordState).toBe('stopRecordInProgress');
            expect(account.onCallActionFailed).toBeCalledWith(
              RTC_CALL_ACTION.STOP_RECORD,
            );
            done();
          });
        });
      });
    });

    it('should report startRecord failed when FSM in connected state but startRecord failed [JPT-687]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockRejectedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.startRecord();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.START_RECORD,
      );
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(session.startRecord).toHaveBeenCalled();
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.START_RECORD,
        );
        done();
      });
    });

    describe('should report startRecord failed when FSM not in connected state [JPT-684]', () => {
      it('should report startRecord failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const session = new MockSession();
        const call = new RTCCall(true, '', session, account, account);
        session.startRecord.mockResolvedValue(null);
        call.startRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.onAccountNotReady();
        const session = new MockSession();
        call.setCallSession(session);
        session.startRecord.mockResolvedValue(null);
        call.startRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.onAccountReady();
        call.startRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.hangup();
        call.startRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });

      it('should report startRecord failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const session = new MockSession();
        const call = new RTCCall(true, '', session, account, account);
        session.startRecord.mockResolvedValue(null);
        call.answer();
        call.startRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.START_RECORD,
          );
          done();
        });
      });
    });
  });

  describe('stopRecord()', () => {
    it('should report stopRecord success when FSM in connected state and stopRecord success [JPT-690]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call._recordState = 'recording';
      call.stopRecord();
      setImmediate(() => {
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.STOP_RECORD,
        );
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(session.stopRecord).toHaveBeenCalled();
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
          {},
        );
        done();
      });
    });

    it('should report stopRecord success when FSM in connected state and is not recording [JPT-689]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.stopRecord.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.stopRecord();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(session.stopRecord).not.toHaveBeenCalled();
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
          {},
        );
        done();
      });
    });

    it('should report stopRecord failed when FSM in connected state but stopRecord failed [JPT-691]', done => {
      const account = new VirturlAccountAndCallObserver();
      const call = new RTCCall(false, '123', null, account, account);
      const session = new MockSession();
      call.setCallSession(session);
      session.startRecord.mockResolvedValue(null);
      session.stopRecord.mockRejectedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
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
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.STOP_RECORD,
        );
        done();
      });
    });

    describe('should report stopRecord failed when FSM not in connected state [JPT-688]', () => {
      it('should report stopRecord failed when FSM in idle state', done => {
        const account = new VirturlAccountAndCallObserver();
        const session = new MockSession();
        const call = new RTCCall(true, '', session, account, account);
        session.stopRecord.mockRejectedValue(null);
        call._isRecording = true;
        call.stopRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.onAccountNotReady();
        const session = new MockSession();
        call.setCallSession(session);
        session.stopRecord.mockResolvedValue(null);
        call._isRecording = true;
        call.stopRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.onAccountReady();
        call._isRecording = true;
        call.stopRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
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
        call.hangup();
        call._isRecording = true;
        call.stopRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });

      it('should report stopRecord failed when FSM in answering state', done => {
        const account = new VirturlAccountAndCallObserver();
        const session = new MockSession();
        const call = new RTCCall(true, '', session, account, account);
        session.stopRecord.mockResolvedValue(null);
        call._isRecording = true;
        call.answer();
        call.stopRecord();
        setImmediate(() => {
          const fsmState = call._fsm.state();
          expect(fsmState).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.STOP_RECORD,
          );
          done();
        });
      });
    });
  });

  describe('Transfer call', () => {
    it('should notify transfer failed when transfer to empty number. [JPT-673]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      session.mockSignal('accepted');
      call.transfer('');
      setImmediate(() => {
        expect(account.onCallActionFailed).toBeCalledWith(
          RTC_CALL_ACTION.TRANSFER,
        );
        done();
      });
    });

    it('should notify transfer success when transfer in connected state and session notify transfer success. [JPT-674]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      session.transfer.mockResolvedValue(null);
      call.answer();
      session.mockSignal('accepted');
      call.transfer('123');
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
        RTC_CALL_ACTION.TRANSFER,
      );
      setImmediate(() => {
        expect(account.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.TRANSFER,
          {},
        );
        done();
      });
    });

    it('should notify transfer failed when transfer in connected state and session notify transfer failed. [JPT-675]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      session.transfer.mockResolvedValue(null);
      call.answer();
      session.mockSignal('accepted');
      call.transfer('123');
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.TRANSFER,
      );
      setImmediate(() => {
        expect(account.onCallActionFailed).toBeCalledWith(
          RTC_CALL_ACTION.TRANSFER,
        );
        done();
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

    it('should stay in idle state when receive accountReady in idle state for incoming call. [JPT-1673]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      expect(call.getCallState()).toBe(RTC_CALL_STATE.IDLE);
      call.onAccountReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.IDLE);
        done();
      });
    });

    it('should stay in idle state when receive accountNotReady in idle state for incoming call. [JPT-1674]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      expect(call.getCallState()).toBe(RTC_CALL_STATE.IDLE);
      call.onAccountNotReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.IDLE);
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
      session.mockSignal('confirmed');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        done();
      });
    });
    it('should call state become disconnected when receive session error in answering state [JPT-732]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
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

  describe('Idle state transitions', () => {
    it('should state transition from Idle to Pending when account not ready [JPT-601]', done => {
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutgoingCallSession');
      account.isReadyReturnValue = false;
      const call = new RTCCall(false, '123', null, account, account);
      call.onAccountNotReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.createOutgoingCallSession).not.toBeCalled();
        done();
      });
    });

    it('should state transition from Idle to Connecting when Account ready [JPT-602]', done => {
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutgoingCallSession');
      account.isReadyReturnValue = true;
      const call = new RTCCall(false, '123', null, account, account);
      call.onAccountReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.toNum).toBe('123');
        expect(account.createOutgoingCallSession).toBeCalled();
        done();
      });
    });
  });

  describe('Pending state transitions', () => {
    it("should state transition from Pending to Connecting when receive 'Account ready' event [JPT-603]", done => {
      const account = new VirturlAccountAndCallObserver();
      jest.spyOn(account, 'createOutgoingCallSession');
      const call = new RTCCall(false, '123', null, account, account);
      call.onAccountReady();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.callState).toBe(RTC_CALL_STATE.CONNECTING);
        expect(account.toNum).toBe('123');
        expect(account.createOutgoingCallSession).toBeCalled();
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
        done();
      });
    });
  });

  describe('Connecting state transitions', () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-605]", done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(false, '123', null, account, account);
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal('accepted');
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.CONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.CONNECTED);
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled();
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
  });

  describe('Connected state transitions', () => {
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(session.terminate).toBeCalled;
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
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
        expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
        expect(account.callState).toBe(RTC_CALL_STATE.DISCONNECTED);
        done();
      });
    });
  });

  describe('park()', () => {
    let account = null;
    let call = null;
    let session = null;

    function setUpAccount() {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account);
      session = new MockSession();
      call.setCallSession(session);
      call.onAccountNotReady();
    }

    it('should report park success with msg when FSM in connected state and park success [JPT-835]', done => {
      setUpAccount();
      session.park.mockResolvedValue('park ok');
      call.onAccountReady();
      session.mockSignal('accepted');
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.PARK,
          'park ok',
        );
        expect(account.onCallActionSuccess).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
          'park ok',
        );
        done();
      });
    });

    it('should report park failed when FSM in connected state and park failed [JPT-831]', done => {
      setUpAccount();
      session.park.mockRejectedValue(null);
      call.onAccountReady();
      session.mockSignal('accepted');
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connected');
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.PARK,
        );
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });

    it('should report park failed when FSM in pending state [JPT-827]', done => {
      setUpAccount();
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('pending');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });

    it('should report park failed when FSM in connecting state [JPT-828]', done => {
      setUpAccount();
      call.onAccountReady();
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('connecting');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });

    it('should report park failed when FSM in disconnected state [JPT-830]', done => {
      setUpAccount();
      call.onAccountReady();
      session.mockSignal('accepted');
      session.mockSignal('failed');
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('disconnected');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });

    it('should report park failed when FSM in idle state [JPT-826]', done => {
      account = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, account, account);
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('idle');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });

    it('should report park failed when FSM in answering state [JPT-829]', done => {
      account = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, account, account);
      call._fsm.answer();
      call.park();
      setImmediate(() => {
        const fsmState = call._fsm.state();
        expect(fsmState).toBe('answering');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.PARK,
        );
        done();
      });
    });
  });

  describe('mute()', () => {
    let observer = null;
    let session = null;
    let call = null;

    function setupCall() {
      observer = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, observer, observer);
    }

    it('should do nothing when isMute is true [JPT-879]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      expect(call._fsm.state()).toBe('connected');
      call._isMute = true;
      expect(call._isMute).toBeTruthy();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(observer.onCallActionSuccess).toBeCalledTimes(1);
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should call mute api and set isMute to true when FSM state in connected [JPT-893]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      expect(call._fsm.state()).toBe('connected');
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(1);
        expect(call._isMute).toBeTruthy();
        expect(observer.onCallActionSuccess).toBeCalledTimes(1);
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should call mute api when FSM enter connected state and isMute is true[JPT-896]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._isMute = true;
      call._fsm._callFsmTable.sessionAccepted();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(1);
        expect(call._fsm.state()).toBe('connected');
        done();
      });
    });

    it('should only set isMute true when FSM state in idle state and isMute is false [JPT-880]', done => {
      setupCall();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(call._isMute).toBeTruthy();
        expect(call._fsm.state()).toBe('idle');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute true when FSM state in connecting and isMute is false [JPT-882]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(call._isMute).toBeTruthy();
        expect(call._fsm.state()).toBe('connecting');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute true when FSM state in answering and isMute is false [JPT-884]', done => {
      setupCall();
      call._fsm._callFsmTable.answer();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(call._isMute).toBeTruthy();
        expect(call._fsm.state()).toBe('answering');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute true when FSM state in pending and isMute is false [JPT-881]', done => {
      setupCall();
      call._fsm._callFsmTable.accountNotReady();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(call._isMute).toBeTruthy();
        expect(call._fsm.state()).toBe('pending');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute true when FSM state in disconnected and isMute is false [JPT-885]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      call._fsm._callFsmTable.sessionDisconnected();
      call.mute();
      setImmediate(() => {
        expect(session.mute).toBeCalledTimes(0);
        expect(call._isMute).toBeTruthy();
        expect(call._fsm.state()).toBe('disconnected');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.MUTE,
          {},
        );
        done();
      });
    });

    it('should isMute is true when mute call and call is in holded state [JPT-886]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.mute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holded');
        expect(call.isMuted()).toBe(true);
        done();
      });
    });

    it('should isMute is true when mute call and call is in holding state [JPT-887]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      call.mute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holding');
        expect(call.isMuted()).toBe(true);
        done();
      });
    });

    it('should isMute is true when mute call and call is in unholding state [JPT-888]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      call.mute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('unholding');
        expect(call.isMuted()).toBe(true);
        done();
      });
    });
  });

  describe('unmute()', () => {
    let observer = null;
    let session = null;
    let call = null;

    function setupCall() {
      observer = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, observer, observer);
    }

    it('should do nothing when isMute is false [JPT-897]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      expect(call._fsm.state()).toBe('connected');
      call._isMute = false;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(1);
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should call unmute api and set isMute to false when FSM state in connected and isMute is true [JPT-906]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(2);
        expect(call._isMute).not.toBeTruthy();
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should call unmute api when FSM enter connected state and isMute is false[JPT-908]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._isMute = false;
      call._fsm._callFsmTable.sessionAccepted();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(1);
        expect(call._fsm.state()).toBe('connected');
        expect(observer.onCallActionSuccess).toBeCalledTimes(0);
        done();
      });
    });

    it('should only set isMute false when FSM state in idle state and isMute is true [JPT-898]', done => {
      setupCall();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(0);
        expect(call._isMute).not.toBeTruthy();
        expect(call._fsm.state()).toBe('idle');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute false when FSM state in connecting and isMute is true [JPT-900]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(0);
        expect(call._isMute).not.toBeTruthy();
        expect(call._fsm.state()).toBe('connecting');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute false when FSM state in answering and isMute is true [JPT-901]', done => {
      setupCall();
      call._fsm._callFsmTable.answer();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(0);
        expect(call._isMute).not.toBeTruthy();
        expect(call._fsm.state()).toBe('answering');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute false when FSM state in pending and isMute is true [JPT-899]', done => {
      setupCall();
      call._fsm._callFsmTable.accountNotReady();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(0);
        expect(call._isMute).not.toBeTruthy();
        expect(call._fsm.state()).toBe('pending');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should only set isMute false when FSM state in disconnected and isMute is true [JPT-902]', done => {
      setupCall();
      call._fsm._callFsmTable.accountReady();
      call._fsm._callFsmTable.sessionAccepted();
      call._fsm._callFsmTable.sessionDisconnected();
      call._isMute = true;
      call.unmute();
      setImmediate(() => {
        expect(session.unmute).toBeCalledTimes(1);
        expect(call._isMute).not.toBeTruthy();
        expect(call._fsm.state()).toBe('disconnected');
        expect(observer.onCallActionSuccess).toBeCalledWith(
          RTC_CALL_ACTION.UNMUTE,
          {},
        );
        done();
      });
    });

    it('should isMute is false when unmute call and call is in holded state [JPT-903]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.mute();
      call.unmute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holded');
        expect(call.isMuted()).toBe(false);
        done();
      });
    });

    it('should isMute is false when unmute call and call is in holding state [JPT-904]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      call.mute();
      call.unmute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holding');
        expect(call.isMuted()).toBe(false);
        done();
      });
    });

    it('should isMute is false when unmute call and call is in unholding state [JPT-905]', done => {
      setupCall();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.answer();
      session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
      call.hold();
      session.emitSessionReinviteAccepted();

      call.unhold();
      call.mute();
      call.unmute();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('unholding');
        expect(call.isMuted()).toBe(false);
        done();
      });
    });
  });

  describe('Hold / Unhold Call', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account);
      session = new MockSession();
      call.setCallSession(session);
    }

    it('should enter holding state and trigger hold action when hold call in connected state. [JPT-820]', done => {
      setup();
      jest.spyOn(call._fsm, 'holdSuccess').mockImplementation(() => {});
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      setImmediate(() => {
        expect(session.hold).toBeCalled();
        expect(call._fsm.state()).toBe('holding');
        done();
      });
    });

    it('should enter holded state when hold call success. [JPT-822]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holded');
        done();
      });
    });

    it('should enter connected state when hold call failed in holding state. [JPT-823]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteFailed();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        done();
      });
    });

    it('should enter connected state wheh hold call throw exception in holding state.', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      setImmediate(() => {
        call._callSession.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.HOLD,
        );
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          done();
        });
      });
    });

    it('should enter unholding state when unhold call in holded state. [JPT-824]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('unholding');
        done();
      });
    });

    it('should enter holded state when unhold call failed in unholding state. [JPT-825]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      call._callSession.emit(
        CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
        RTC_CALL_ACTION.UNHOLD,
      );
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holded');
        done();
      });
    });

    it('should enter connected state when unhold success in unholding state. [JPT-842]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      session.sessionDescriptionHandler.setDirectionFlag(false);
      session.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        done();
      });
    });

    it('should enter disconnected state when hangup in holding state. [JPT-832]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      call.hangup();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session error in holding state. [JPT-833]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.mockSignal(WEBPHONE_SESSION_STATE.FAILED);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session disconnected in holding state. [JPT-834]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.mockSignal(WEBPHONE_SESSION_STATE.BYE);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when hangup in holded state. [JPT-836]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.hangup();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session error in holded state. [JPT-837]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      session.mockSignal(WEBPHONE_SESSION_STATE.FAILED);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session disconnected in holded state. [JPT-838]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      session.mockSignal(WEBPHONE_SESSION_STATE.BYE);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when hangup in unholding state. [JPT-839]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      call.hangup();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session error in unholding state. [JPT-840]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      session.mockSignal(WEBPHONE_SESSION_STATE.FAILED);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should enter disconnected state when session disconnected in unholding state. [JPT-841]', done => {
      setup();
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      session.mockSignal(WEBPHONE_SESSION_STATE.BYE);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        done();
      });
    });
  });

  describe('new call with options', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup(options: RTCCallOptions) {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account, options);
      session = new MockSession();
      call.setCallSession(session);
    }
    it('should call createOutingCallSession with options when new Call with options param. [JPT-820]', done => {
      const options: RTCCallOptions = { anonymous: true };
      setup(options);
      jest.spyOn(call, '_onCreateOutingCallSession');
      call.onAccountReady();
      setImmediate(() => {
        expect(call._options).toEqual(options);
        expect(call._onCreateOutingCallSession).toBeCalled();
        done();
      });
    });
  });

  describe('setHangupTimeout', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account);
      session = new MockSession();
      call.setCallSession(session);
    }

    it('should set timer when create outgoing call [JPT-985]', () => {
      setup();
      expect(call._hangupInvalidCallTimer).not.toEqual(null);
    });

    it('should clear timer when session receive response 183 event [JPT-987]', done => {
      setup();
      expect(call._hangupInvalidCallTimer).not.toBeNull();
      session.mockSignal(WEBPHONE_SESSION_STATE.PROGRESS, { status_code: 183 });
      setImmediate(() => {
        expect(call._hangupInvalidCallTimer).toBeNull();
        done();
      });
    });

    it('should not clear timer when session receive response is not 183 event', done => {
      setup();
      expect(call._hangupInvalidCallTimer).not.toBeNull();
      session.mockSignal(WEBPHONE_SESSION_STATE.PROGRESS, { status_code: 100 });
      setImmediate(() => {
        expect(call._hangupInvalidCallTimer).not.toBeNull();
        done();
      });
    });

    it('should clear timer when enter connected state [JPT-994]', done => {
      setup();
      expect(call._hangupInvalidCallTimer).not.toBeNull();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._hangupInvalidCallTimer).toBeNull();
        done();
      });
    });

    it('should clear timer when enter connected state', done => {
      setup();
      expect(call._hangupInvalidCallTimer).not.toBeNull();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(call._hangupInvalidCallTimer).toBeNull();
        done();
      });
    });

    it('should not set timer when get incoming call [JPT-986]', () => {
      account = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, account, account);
      expect(call._hangupInvalidCallTimer).toEqual(null);
    });

    it('should clear timer and notify call delegate when session emit progress event [JPT-988]', done => {
      jest.useFakeTimers();
      setup();
      jest.spyOn(call, 'hangup');
      jest.advanceTimersByTime(kRTCHangupInvalidCallInterval * 1000);
      setImmediate(() => {
        expect(call.hangup).toBeCalled();
        expect(account.onCallActionFailed).toBeCalledWith(
          RTC_CALL_ACTION.CALL_TIME_OUT,
        );
        done();
      });
    });
  });

  describe('Ignore incoming call', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      session = new MockSession();
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(true, '', session, account, account);
    }
    it('should call state changed to Disconnected when call ignore API in idle state. [JPT-1468]', done => {
      setup();
      setImmediate(() => {
        expect(call.getCallState()).toBe(RTC_CALL_STATE.IDLE);
        expect(call._fsm.state()).toBe('idle');
        call.ignore();
        setImmediate(() => {
          expect(call.getCallState()).toBe(RTC_CALL_STATE.DISCONNECTED);
          expect(call._fsm.state()).toBe('disconnected');
          done();
        });
      });
    });
  });

  describe('DTMF', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account);
      call.onAccountNotReady();
      session = new MockSession();
      call.setCallSession(session);
      session.hold.mockResolvedValue(null);
      session.unhold.mockResolvedValue(null);
    }

    it('should trigger dtmf function when call dtmf and call is in connected state. [JPT-859]', done => {
      setup();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should trigger dtmf function when call dtmf and call is in connecting state. [JPT-860]', done => {
      setup();
      call.onAccountReady();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connecting');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should trigger dtmf function when call dtmf and call is in answering state. [JPT-861]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.answer();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('answering');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should trigger dtmf function when call dtmf and call is in holding state. [JPT-989]', done => {
      setup();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holding');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should trigger dtmf function when call dtmf and call is in holded state. [JPT-990]', done => {
      setup();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('holded');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should trigger dtmf function when call dtmf and call is in unholding state. [JPT-991]', done => {
      setup();
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
      call.hold();
      session.emitSessionReinviteAccepted();
      call.unhold();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('unholding');
        expect(session.dtmf).toBeCalled();
        done();
      });
    });

    it('should not trigger dtmf function when call dtmf in idle state. [JPT-862]', done => {
      const account = new VirturlAccountAndCallObserver();
      const session = new MockSession();
      const call = new RTCCall(true, '', session, account, account);
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('idle');
        expect(session.dtmf).toBeCalledTimes(0);
        done();
      });
    });

    it('should not trigger dtmf function when call dtmf in pending state. [JPT-863]', done => {
      setup();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('pending');
        expect(session.dtmf).toBeCalledTimes(0);
        done();
      });
    });

    it('should not trigger dtmf function when call dtmf in disconnected state. [JPT-864]', done => {
      setup();
      call.hangup();
      call.dtmf('1');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('disconnected');
        expect(session.dtmf).toBeCalledTimes(0);
        done();
      });
    });
  });

  describe('getStats', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      call = new RTCCall(false, '123', null, account, account);
      session = new MockSession();
      call.setCallSession(session);
      call.onAccountReady();
      session.mockSignal(WEBPHONE_SESSION_STATE.ACCEPTED);
    }

    it('should get media statics per 2s and print log to console when call enter connected state. [JPT-997]', done => {
      setup();
      jest.spyOn(rtcLogger, 'info');
      jest.spyOn(session.mediaStreams, 'getMediaStats');
      call._rtcMediaStatsManager.setMediaStatsReport('report');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('connected');
        expect(session.mediaStreams.getMediaStats.mock.calls[0][1]).toBe(2000);
        expect(rtcLogger.info).toHaveBeenCalledTimes(1);
        done();
      });
    });
    describe('should stop get media stats when call leave connected state. [JPT-998]', () => {
      it('should stop get media stats when call enter disconnected state from connected state', done => {
        setup();
        jest.spyOn(session.mediaStreams, 'stopMediaStats');
        call.hangup();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(session.mediaStreams.stopMediaStats).toBeCalled();
          done();
        });
      });

      it('should stop get media stats when enter holded state from connected state.', done => {
        setup();
        jest.spyOn(session.mediaStreams, 'stopMediaStats');
        session.hold.mockResolvedValue(null);
        call.hold();
        session.emitSessionReinviteAccepted();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('holded');
          expect(session.mediaStreams.stopMediaStats).toBeCalled();
          done();
        });
      });
    });
  });

  describe('Forward call', () => {
    const forwardNumber = '10000';
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, account, account);
    }

    it('should report forward failed when forward incoming call without phone number [JPT-1301]', done => {
      setup();
      jest.spyOn(account, 'onCallActionFailed');
      call.forward('');
      setImmediate(() => {
        expect(call._fsm.state()).toBe('idle');
        expect(account.onCallActionFailed).toHaveBeenCalledWith(
          RTC_CALL_ACTION.FORWARD,
        );
        done();
      });
    });

    it("should call webphone's forward API when forward incoming call in idle state", done => {
      setup();
      call.forward(forwardNumber);
      setImmediate(() => {
        expect(call._fsm.state()).toBe('forwarding');
        expect(session.forward).toBeCalled();
        done();
      });
    });

    it("should call state change to forwarding and call webphone's forward API when call forward in replying state. [JPT-1763]", done => {
      setup();
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('forwarding');
          expect(session.forward).toBeCalled();
          done();
        });
      });
    });

    describe('should report forward failed when forward incoming call and FSM is not idle state [JPT-1302]', () => {
      it('should report forward failed when forward incoming call and FSM is pending state', done => {
        setup();
        call._fsm.accountNotReady();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('pending');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is answering state', done => {
        setup();
        call._fsm.answer();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('answering');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is forwarding state', done => {
        setup();
        call._fsm.forward();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('forwarding');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is connecting state', done => {
        setup();
        call._fsm.accountReady();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connecting');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is connected state', done => {
        setup();
        call._fsm.answer();
        call._fsm.sessionConfirmed();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('connected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is holding state', done => {
        setup();
        session.hold.mockResolvedValue(null);
        call._fsm.answer();
        call._fsm.sessionConfirmed();
        call._fsm.hold();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('holding');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is holded state', done => {
        setup();
        session.hold.mockResolvedValue(null);
        call._fsm.answer();
        call._fsm.sessionConfirmed();
        call._fsm.hold();
        call._fsm.holdSuccess();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('holded');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is unholding state', done => {
        setup();
        session.hold.mockResolvedValue(null);
        session.unhold.mockResolvedValue(null);
        call.answer();
        session.mockSignal(WEBPHONE_SESSION_STATE.CONFIRMED);
        call.hold();
        session.emitSessionReinviteAccepted();
        call.unhold();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('unholding');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });

      it('should report forward failed when forward incoming call and FSM is disconnected state', done => {
        setup();
        call._fsm.accountReady();
        call._fsm.hangup();
        call.forward(forwardNumber);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(account.onCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.FORWARD,
          );
          done();
        });
      });
    });
  });

  describe('Reply incoming call with message', () => {
    let account: VirturlAccountAndCallObserver;
    let call: RTCCall;
    let session: MockSession;
    function setup() {
      account = new VirturlAccountAndCallObserver();
      session = new MockSession();
      call = new RTCCall(true, '123', session, account, account);
    }

    it('should call state changed to replying when call startReply api in idle state. [JPT-1422]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        expect(session.sendSessionMessage).toBeCalled();
        done();
      });
    });

    it('should call state changed to answering when call answer api in replying state. [JPT-1423]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.answer();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('answering');
          expect(session.accept).toBeCalled();
          done();
        });
      });
    });

    it('should call state changed to disconnected when call replyWithMessage api in replying state. [JPT-1424]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.replyWithMessage('123');
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(session.replyWithMessage).toBeCalled();
          done();
        });
      });
    });

    it('should call state changed to disconnected when call replyWithPattern api in replying state. [JPT-1425]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.replyWithPattern(RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER);
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(session.replyWithMessage).toBeCalled();
          done();
        });
      });
    });

    it('should call state change to disconnected when receive sessionDisconnected in replying state. [JPT-1426]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        session.mockSignal('bye');
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          done();
        });
      });
    });

    it("should call webphone's sendToVoicemail api when call sendToVoicemail api in replying state. [JPT-1427]", done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.sendToVoicemail();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(session.toVoicemail).toBeCalled();
          done();
        });
      });
    });

    it("should call webphone's reject api when call reject api in replying state. [JPT-1428]", done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.reject();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          expect(session.reject).toBeCalled();
          done();
        });
      });
    });

    it('should call state change to disconnected when call ignore api in replying state. [JPT-1470]', done => {
      setup();
      expect(call._fsm.state()).toBe('idle');
      call.startReply();
      setImmediate(() => {
        expect(call._fsm.state()).toBe('replying');
        call.ignore();
        setImmediate(() => {
          expect(call._fsm.state()).toBe('disconnected');
          done();
        });
      });
    });
  });
});
