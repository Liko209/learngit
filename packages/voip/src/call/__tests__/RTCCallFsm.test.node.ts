/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:07:54
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCallFsm } from '../RTCCallFsm';
import { CALL_FSM_NOTIFY } from '../types';
import { RTC_CALL_ACTION } from '../../api/types';
import { CallReport } from '../../report/Call';

describe('Call FSM UT', () => {
  class MockCallFsmLisener {
    private _fsm: RTCCallFsm;
    constructor(fsm: RTCCallFsm) {
      this._fsm = fsm;
      fsm.on(CALL_FSM_NOTIFY.ENTER_ANSWERING, () => {
        this.onEnterAnswering();
      });
      fsm.on(CALL_FSM_NOTIFY.ENTER_PENDING, () => {
        this.onEnterPending();
      });
      fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTING, () => {
        this.onEnterConnecting();
      });
      fsm.on(CALL_FSM_NOTIFY.ENTER_CONNECTED, () => {
        this.onEnterConnected();
      });
      fsm.on(CALL_FSM_NOTIFY.ENTER_DISCONNECTED, () => {
        this.onEnterDisconnected();
      });
      fsm.on(CALL_FSM_NOTIFY.HANGUP_ACTION, () => {
        this.onHangupAction();
      });
      fsm.on(CALL_FSM_NOTIFY.CREATE_OUTGOING_CALL_SESSION, () => {
        this.onCreateOutCallSession();
      });
    }

    public onEnterAnswering() {}

    public onEnterPending() {}

    public onEnterConnecting() {}

    public onEnterConnected() {}

    public onEnterDisconnected() {}

    public onHangupAction() {}

    public onCreateOutCallSession() {}
  }

  function createFsm() {
    const ret = new RTCCallFsm(new CallReport());
    return ret;
  }

  describe('Idle state transitions', () => {
    it("should state transition from Idle to Pending when receive 'Account not ready' event [JPT-580]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterPending');
      fsm.accountNotReady();
      setImmediate(() => {
        expect(fsm.state()).toBe('pending');
        expect(listener.onEnterPending).toHaveBeenCalled();
        done();
      });
    });

    it("should state transition from Idle to Connecting when receive 'Account ready' event [JPT-581]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnecting');
      jest.spyOn(listener, 'onCreateOutCallSession');
      fsm.accountReady();

      setImmediate(() => {
        expect(fsm.state()).toBe('connecting');
        expect(listener.onEnterConnecting).toHaveBeenCalled();
        expect(listener.onCreateOutCallSession).toHaveBeenCalled();
        done();
      });
    });

    it("should state transition from Idle to Disconnected when receive 'Hang up' event [JPT-582]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      jest.spyOn(listener, 'onHangupAction');
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        expect(listener.onHangupAction).toHaveBeenCalled();
        done();
      });
    });

    it('should state transition from Idle to Answering when receive answer event [JPT-619]', done => {
      const fsm = createFsm();
      fsm.answer();
      setImmediate(() => {
        expect(fsm.state()).toBe('answering');
        done();
      });
    });

    it("State transition from Idle to Disconnected when receive 'Reject' event [JPT-615]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.reject();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });

    it("State transition from Idle to Disconnected when receive 'SendToVoicemail' event [JPT-618]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.sendToVoicemail();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
    it('should state transition from Idle to disconnected when receive sessionDisconnected event [JPT-656]', done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
    it('should state transition from Idle to disconnected when receive sessionError event [JPT-731]', done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
  });

  describe('Answering state transitions', () => {
    it("State transition from Answering to Connected when receive 'Session confirmed' event [JPT-620]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm.answer();
      fsm.sessionConfirmed();
      setImmediate(() => {
        expect(fsm.state()).toBe('connected');
        expect(listener.onEnterConnected).toHaveBeenCalled();
        done();
      });
    });

    it("State transition from Answering to Disconnected when receive 'Hangup' event [JPT-622]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.answer();
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        done();
      });
    });

    it("State transition from Answering to Disconnected when receive 'sessionError' event [JPT-621]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.answer();
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        done();
      });
    });
    it("State transition from Answering to Disconnected when receive 'sessionDisconnected' event [JPT-657]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.answer();
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Pending state transitions', () => {
    it("should state  transition from Pending to Connecting when receive 'Account ready' event [JPT-583]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm.accountNotReady();
      jest.spyOn(listener, 'onEnterConnecting');
      jest.spyOn(listener, 'onCreateOutCallSession');
      fsm.accountReady();
      setImmediate(() => {
        expect(fsm.state()).toBe('connecting');
        expect(listener.onEnterConnecting).toHaveBeenCalled();
        expect(listener.onCreateOutCallSession).toHaveBeenCalled();
        done();
      });
    });

    it("should state transition from Pending to Disconnected when receive 'Hang up' event [JPT-584]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm.accountNotReady();
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Connecting state transitions', () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-585]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm.accountReady();
      fsm.sessionAccepted();
      setImmediate(() => {
        expect(fsm.state()).toBe('connected');
        expect(listener.onEnterConnected).toHaveBeenCalled();
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Hang up' event [JPT-586]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      jest.spyOn(listener, 'onHangupAction');
      fsm.accountReady();
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toHaveBeenCalled();
        expect(listener.onHangupAction).toHaveBeenCalled();
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session disconnected' event [JPT-587]", done => {
      const fsm = createFsm();
      fsm.accountReady();
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session error' event [JPT-588]", done => {
      const fsm = createFsm();
      fsm.accountReady();
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
  });

  describe('Connected state transitions', () => {
    it("should state transition from Connected to Disconnected when receive 'Hang up' event [JPT-589]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onHangupAction');
      fsm.accountReady();
      fsm.sessionConfirmed();
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onHangupAction).toHaveBeenCalled();
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-590]", done => {
      const fsm = createFsm();
      fsm.accountReady();
      fsm.sessionConfirmed();
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session error' event [JPT-591]", done => {
      const fsm = createFsm();
      fsm.accountReady();
      fsm.sessionConfirmed();
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });

    describe('flip()', () => {
      it("should state transition from Connected to Connected when receive 'flip' event", done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onFlipAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.flip(5);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onFlipAction).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('startRecord()', () => {
      it("should state transition from Connected to Connected when receive 'startRecord' event", done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onStartRecordAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.startRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStartRecordAction).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('stopRecord()', () => {
      it("should state transition from Connected to Connected when receive 'stopRecord' event", done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onStopRecordAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.stopRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStopRecordAction).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('stopRecord()', () => {
      it('should notify transfer failed when transfer call in idle state [JPT-672]', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in pending state [JPT-672]', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.accountNotReady();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in answering state [JPT-672]', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.answer();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in connecting state [JPT-672]', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.accountReady();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in disconnected state [JPT-672]', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.hangup();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalled();
          done();
        });
      });
      it('should trigger transfer action when transfer call in connected state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onTransferAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onTransferAction).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('park()', () => {
    it('should call park api when fsm in connected state [JPT-821]', done => {
      const callFsm = new RTCCallFsm(new CallReport());
      jest.spyOn(callFsm, 'onParkAction');
      callFsm.accountReady();
      callFsm.sessionAccepted();
      callFsm.park();
      setImmediate(() => {
        expect(callFsm.state()).toBe('connected');
        expect(callFsm.onParkAction).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('forward()', () => {
    const forwardNumber = '10086';
    it('should FSM enter forwarding state from Idle state when receive ‘forward’ event [JPT-1298]', done => {
      const callFsm = new RTCCallFsm(new CallReport());
      jest.spyOn(callFsm, 'onForwardAction');
      callFsm.forward(forwardNumber);
      setImmediate(() => {
        expect(callFsm.state()).toBe('forwarding');
        expect(callFsm.onForwardAction).toHaveBeenCalled();
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘hangup’ event [JPT-1299]', done => {
      const callFsm = new RTCCallFsm(new CallReport());
      callFsm.forward(forwardNumber);
      callFsm.hangup();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘sessionDisconnected’ event [JPT-1319]', done => {
      const callFsm = new RTCCallFsm(new CallReport());
      callFsm.forward(forwardNumber);
      callFsm.sessionDisconnected();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘sessionError’ event [JPT-1320]', done => {
      const callFsm = new RTCCallFsm(new CallReport());
      callFsm.forward(forwardNumber);
      callFsm.sessionError();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    describe('should FSM state does not change when receive ‘forward’ event in non-Idle state [JPT-1300]', () => {
      it('should FSM enter pending state from pending state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountNotReady();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('pending');
          done();
        });
      });

      it('should FSM enter answering state from answering state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('answering');
          done();
        });
      });

      it('should FSM enter forwarding state from forwarding state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.forward(forwardNumber);
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('forwarding');
          done();
        });
      });

      it('should FSM enter connecting state from connecting state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connecting');
          done();
        });
      });

      it('should FSM enter connected state from connected state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        callFsm.sessionConfirmed();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          done();
        });
      });

      it('should FSM enter holding state from holding state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        callFsm.sessionConfirmed();
        callFsm.hold();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('holding');
          done();
        });
      });

      it('should FSM enter holded state from holded state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        callFsm.sessionConfirmed();
        callFsm.hold();
        callFsm.holdSuccess();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('holded');
          done();
        });
      });

      it('should FSM enter unholding state from unholding state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        callFsm.sessionConfirmed();
        callFsm.hold();
        callFsm.holdSuccess();
        callFsm.unhold();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('unholding');
          done();
        });
      });

      it('should FSM enter disconnected state from disconnected state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.hangup();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('disconnected');
          done();
        });
      });
    });
  });

  describe('warmTransfer()', () => {
    describe('should report fail and FSM back to last state if current FSM is in idle/pending/answering/replying/forwarding/connecting/disconnected when call warmTransfer API [JPT-2543]', () => {
      const targetSession = 'targetSession';
      it('should report fail and FSM enter idle state when warmTransfer() in idle state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('idle');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter pending state when warmTransfer() in pending state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountNotReady();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('pending');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter answering state when warmTransfer() in answering state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.answer();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('answering');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter replying state when warmTransfer() in replying state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.startReplyWithMessage();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('replying');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter forwarding state when warmTransfer() in forwarding state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.forward('100');
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('forwarding');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter connecting state when warmTransfer() in connecting state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connecting');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });

      it('should report fail and FSM enter disconnected state when warmTransfer() in disconnected state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.hangup();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('disconnected');
          expect(callFsm.onReportCallActionFailed).toHaveBeenCalledWith(
            RTC_CALL_ACTION.WARM_TRANSFER,
          );
          done();
        });
      });
    });

    describe('should call session WarmTransfer() when current FSM is in connected/holding/holded/unholding state [JPT-2683]', () => {
      const targetSession = 'targetSession';
      it('should call session WarmTransfer() when warmTransfer() in connected state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.sessionAccepted();
        jest.spyOn(callFsm, 'onWarmTransferAction');
        callFsm.warmTransfer(targetSession);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onWarmTransferAction).toHaveBeenCalledWith(
            targetSession,
          );
          done();
        });
      });
      it('should call session WarmTransfer() when warmTransfer() in holding state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.hold();
        setImmediate(() => {
          expect(callFsm.state()).toBe('holding');
          jest.spyOn(callFsm, 'onWarmTransferAction');
          callFsm.warmTransfer(targetSession);
          setImmediate(() => {
            expect(callFsm.state()).toBe('holding');
            expect(callFsm.onWarmTransferAction).toHaveBeenCalledWith(
              targetSession,
            );
            done();
          });
        });
      });
      it('should call session WarmTransfer() when warmTransfer() in holded state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.hold();
        callFsm.holdSuccess();
        setImmediate(() => {
          expect(callFsm.state()).toBe('holded');
          jest.spyOn(callFsm, 'onWarmTransferAction');
          callFsm.warmTransfer(targetSession);
          setImmediate(() => {
            expect(callFsm.state()).toBe('holded');
            expect(callFsm.onWarmTransferAction).toHaveBeenCalledWith(
              targetSession,
            );
            done();
          });
        });
      });
      it('should call session WarmTransfer() when warmTransfer() in unholding state', done => {
        const callFsm = new RTCCallFsm(new CallReport());
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.hold();
        callFsm.holdSuccess();
        callFsm.unhold();
        setImmediate(() => {
          expect(callFsm.state()).toBe('unholding');
          jest.spyOn(callFsm, 'onWarmTransferAction');
          callFsm.warmTransfer(targetSession);
          setImmediate(() => {
            expect(callFsm.state()).toBe('unholding');
            expect(callFsm.onWarmTransferAction).toHaveBeenCalledWith(
              targetSession,
            );
            done();
          });
        });
      });
    });
  });
});
