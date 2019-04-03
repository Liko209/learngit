/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:07:54
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCCallFsm } from '../RTCCallFsm';
import { CALL_FSM_NOTIFY } from '../types';

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
    const ret = new RTCCallFsm();
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
        expect(listener.onEnterPending).toBeCalled();
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
        expect(listener.onEnterConnecting).toBeCalled();
        expect(listener.onCreateOutCallSession).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
        expect(listener.onHangupAction).toBeCalled();
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
        expect(listener.onEnterConnected).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
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
        expect(listener.onEnterConnecting).toBeCalled();
        expect(listener.onCreateOutCallSession).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
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
        expect(listener.onEnterConnected).toBeCalled();
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
        expect(listener.onEnterDisconnected).toBeCalled();
        expect(listener.onHangupAction).toBeCalled();
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
        expect(listener.onHangupAction).toBeCalled();
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
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onFlipAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.flip(5);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onFlipAction).toBeCalled();
          done();
        });
      });
    });

    describe('startRecord()', () => {
      it("should state transition from Connected to Connected when receive 'startRecord' event", done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onStartRecordAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.startRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStartRecordAction).toBeCalled();
          done();
        });
      });
    });

    describe('stopRecord()', () => {
      it("should state transition from Connected to Connected when receive 'stopRecord' event", done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onStopRecordAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.stopRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStopRecordAction).toBeCalled();
          done();
        });
      });
    });

    describe('stopRecord()', () => {
      it('should notify transfer failed when transfer call in idle state [JPT-672]', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toBeCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in pending state [JPT-672]', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.accountNotReady();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toBeCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in answering state [JPT-672]', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.answer();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toBeCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in connecting state [JPT-672]', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.accountReady();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toBeCalled();
          done();
        });
      });
      it('should notify transfer failed when transfer call in disconnected state [JPT-672]', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onReportCallActionFailed');
        callFsm.hangup();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onReportCallActionFailed).toBeCalled();
          done();
        });
      });
      it('should trigger transfer action when transfer call in connected state', done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onTransferAction');
        callFsm.accountReady();
        callFsm.sessionAccepted();
        callFsm.transfer('123');
        setImmediate(() => {
          expect(callFsm.onTransferAction).toBeCalled();
          done();
        });
      });
    });
  });

  describe('park()', () => {
    it('should call park api when fsm in connected state [JPT-821]', done => {
      const callFsm = new RTCCallFsm();
      jest.spyOn(callFsm, 'onParkAction');
      callFsm.accountReady();
      callFsm.sessionAccepted();
      callFsm.park();
      setImmediate(() => {
        expect(callFsm.state()).toBe('connected');
        expect(callFsm.onParkAction).toBeCalled();
        done();
      });
    });
  });

  describe('forward()', () => {
    const forwardNumber = '10086';
    it('should FSM enter forwarding state from Idle state when receive ‘forward’ event [JPT-1298]', done => {
      const callFsm = new RTCCallFsm();
      jest.spyOn(callFsm, 'onForwardAction');
      callFsm.forward(forwardNumber);
      setImmediate(() => {
        expect(callFsm.state()).toBe('forwarding');
        expect(callFsm.onForwardAction).toBeCalled();
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘hangup’ event [JPT-1299]', done => {
      const callFsm = new RTCCallFsm();
      callFsm.forward(forwardNumber);
      callFsm.hangup();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘sessionDisconnected’ event [JPT-1319]', done => {
      const callFsm = new RTCCallFsm();
      callFsm.forward(forwardNumber);
      callFsm.sessionDisconnected();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    it('should FSM enter disconnected state from forwarding state when receive ‘sessionError’ event [JPT-1320]', done => {
      const callFsm = new RTCCallFsm();
      callFsm.forward(forwardNumber);
      callFsm.sessionError();
      setImmediate(() => {
        expect(callFsm.state()).toBe('disconnected');
        done();
      });
    });

    describe('should FSM state does not change when receive ‘forward’ event in non-Idle state [JPT-1300]', () => {
      it('should FSM enter pending state from pending state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
        callFsm.accountNotReady();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('pending');
          done();
        });
      });

      it('should FSM enter answering state from answering state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
        callFsm.answer();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('answering');
          done();
        });
      });

      it('should FSM enter forwarding state from forwarding state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
        callFsm.forward(forwardNumber);
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('forwarding');
          done();
        });
      });

      it('should FSM enter connecting state from connecting state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
        callFsm.accountReady();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connecting');
          done();
        });
      });

      it('should FSM enter connected state from connected state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
        callFsm.answer();
        callFsm.sessionConfirmed();
        callFsm.forward(forwardNumber);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          done();
        });
      });

      it('should FSM enter holding state from holding state when receive ‘forward’ event', done => {
        const callFsm = new RTCCallFsm();
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
        const callFsm = new RTCCallFsm();
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
        const callFsm = new RTCCallFsm();
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
        const callFsm = new RTCCallFsm();
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
});
