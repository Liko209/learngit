/*
 * @Author: Jimmy Xu (jimmy.xu@ringcentral.com)
 * @Date: 2018-12-29 16:07:54
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../__tests__/types.d.ts" />
import { RTCCallFsm } from '../RTCCallFsm';
import { CALL_FSM_NOTIFY } from '../types';

describe('Call FSM UT', async () => {
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
    it('should state transition from Idle to disconnected when receive sessionDisconnected event [JPT-618]', done => {
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
    it("State transition from Answering to Disconnected when receive 'sessionDisconnected' event [JPT-621]", done => {
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

  describe('Pending state transitions', async () => {
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

  describe('Connecting state transitions', async () => {
    it("should state transition from Connecting to Connected when receive 'Session confirmed' event [JPT-585]", done => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm.accountReady();
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

  describe('Connected state transitions', async () => {
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
  });
});
