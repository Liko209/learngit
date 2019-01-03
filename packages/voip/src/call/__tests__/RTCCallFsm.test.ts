/// <reference path="../../__tests__/types.d.ts" />
import { RTCCallFsm } from '../RTCCallFsm';

describe('Call FSM UT', async () => {
  class MockCallFsmLisener {
    private _fsm: RTCCallFsm;
    constructor(fsm: RTCCallFsm) {
      this._fsm = fsm;
      fsm.on('enterPending', () => {
        this.onEnterPending();
      });
      fsm.on('enterConnecting', () => {
        this.onEnterConnecting();
      });
      fsm.on('enterConnected', () => {
        this.onEnterConnected();
      });
      fsm.on('enterDisconnected', () => {
        this.onEnterDisconnected();
      });
      fsm.on('hangupAction', () => {
        this.onHangupAction();
      });
      fsm.on('createOutCallSession', () => {
        this.onCreateOutCallSession();
      });
    }

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

  describe('Idle state transitions', async () => {
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
  });

  describe('Pending state transitions', async () => {
    it("should state  transition from Pending to Connecting when receive 'Account ready' event [JPT-583]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm._fsmGoto('pending');
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
      fsm._fsmGoto('pending');
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onEnterDisconnected).toBeCalled();
        done();
      });
    });
  });

  describe('Connecting state transitions', async () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-585]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm._fsmGoto('connecting');
      fsm.sessionConfirmed();
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
      fsm._fsmGoto('connecting');
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
      fsm._fsmGoto('connecting');
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });

    it("should state transition from Connecting to Disconnected when receive 'Session error' event [JPT-588]", done => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
  });

  describe('Connected state transitions', async () => {
    it("should state transition from Connected to Disconnected when receive 'Hang up' event [JPT-589]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onHangupAction');
      fsm._fsmGoto('connected');
      fsm.hangup();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        expect(listener.onHangupAction).toBeCalled();
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-590]", done => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm.sessionDisconnected();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });
    it("should state transition from Connected to Disconnected when receive 'Session error' event [JPT-591]", done => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm.sessionError();
      setImmediate(() => {
        expect(fsm.state()).toBe('disconnected');
        done();
      });
    });

    describe('flip()', async () => {
      it("should state transition from Connected to Connected when receive 'flip' event", done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onFlipAction');
        callFsm._fsmGoto('connected');
        callFsm.flip(5);
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onFlipAction).toBeCalled();
          done();
        });
      });
    });

    describe('startRecord()', async () => {
      it("should state transition from Connected to Connected when receive 'startRecord' event", done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onStartRecordAction');
        callFsm._fsmGoto('connected');
        callFsm.startRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStartRecordAction).toBeCalled();
          done();
        });
      });
    });

    describe('stopRecord()', async () => {
      it("should state transition from Connected to Connected when receive 'stopRecord' event", done => {
        const callFsm = new RTCCallFsm();
        jest.spyOn(callFsm, 'onStopRecordAction');
        callFsm._fsmGoto('connected');
        callFsm.stopRecord();
        setImmediate(() => {
          expect(callFsm.state()).toBe('connected');
          expect(callFsm.onStopRecordAction).toBeCalled();
          done();
        });
      });
    });
  });
});
