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
    }

    public onEnterPending() {}

    public onEnterConnecting() {}

    public onEnterConnected() {}

    public onEnterDisconnected() {}
  }

  function createFsm() {
    const ret = new RTCCallFsm();
    return ret;
  }

  describe('Call Fsm queue Test', async () => {
    it('Trigger account ready', async () => {
      const fsm = createFsm();
      fsm.accountReady();
      expect(fsm._tailTask('accountReadyEvent'));
    });
    it('Trigge account not ready', async () => {
      const fsm = createFsm();
      fsm.accountNotReady();
      expect(fsm._tailTask('accountNotReadyEvent'));
    });
    it('Trigger hang up', async () => {
      const fsm = createFsm();
      fsm.hangup();
      expect(fsm._tailTask('hangupEvent'));
    });
    it('Trigger session confirmed', async () => {
      const fsm = createFsm();
      fsm.sessionConfirmed();
      expect(fsm._tailTask('sessionConfirmedEvent'));
    });
    it('Trigger session disconnected', async () => {
      const fsm = createFsm();
      fsm.accountReady();
      expect(fsm._tailTask('sessionDisconnectedEvent'));
    });
    it('Trigger session error', async () => {
      const fsm = createFsm();
      fsm.sessionError();
      expect(fsm._tailTask('sessionErrorEvent'));
    });
  });

  describe('Idle state transitions', async () => {
    it("State transition from Idle to Pending when receive 'Account not ready' event [JPT-580]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnecting');
      fsm._onAccountNotReady();
      expect(fsm.state()).toBe('pending');
      expect(listener.onEnterConnecting).toBeCalled();
    });

    it("State transition from Idle to Connecting when receive 'Account ready' event [JPT-581]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnecting');
      fsm._onAccountReady();
      expect(fsm.state()).toBe('connecting');
      expect(listener.onEnterConnecting).toBeCalled();
    });

    it("State transition from Idle to Disconnected when receive 'Hang up' event [JPT-582]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm._onHangup();
      expect(fsm.state()).toBe('disconnected');
      expect(listener.onEnterDisconnected).toBeCalled();
    });
  });

  describe('Pending state transitions', async () => {
    it("State transition from Pending to Connecting when receive 'Account ready' event [JPT-583]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm._fsmGoto('pending');
      jest.spyOn(listener, 'onEnterConnecting');
      fsm._onAccountReady();
      expect(fsm.state()).toBe('connecting');
      expect(listener.onEnterConnecting).toBeCalled();
    });

    it("State transition from Pending to Disconnected when receive 'Hang up' event [JPT-584]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm._fsmGoto('pending');
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm._onHangup();
      expect(fsm.state()).toBe('disconnected');
      expect(listener.onEnterDisconnected).toBeCalled();
    });
  });

  describe('Connecting state transitions', async () => {
    it("State transition from Connecting to Connected when receive 'Session confirmed' event [JPT-585]", async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm._fsmGoto('connecting');
      fsm._onSessionConfirmed();
      expect(fsm.state()).toBe('connected');
      expect(listener.onEnterConnected).toBeCalled();
    });

    it("State transition from Connecting to Disconnected when receive 'Hang up' event [JPT-586]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm._onHangup();
      expect(fsm.state()).toBe('disconnected');
    });

    it("State transition from Connecting to Disconnected when receive 'Session disconnected' event [JPT-587]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm._onSessionDisconnected();
      expect(fsm.state()).toBe('disconnected');
    });

    it("State transition from Connecting to Disconnected when receive 'Session error' event [JPT-588]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm._onSessionError();
      expect(fsm.state()).toBe('disconnected');
    });
  });

  describe('Connected state transitions', async () => {
    it("State transition from Connected to Disconnected when receive 'Hang up' event [JPT-589]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm._onHangup();
      expect(fsm.state()).toBe('disconnected');
    });
    it("State transition from Connected to Disconnected when receive 'Session disconnected' event [JPT-590]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm._onSessionDisconnected();
      expect(fsm.state()).toBe('disconnected');
    });
    it("State transition from Connected to Disconnected when receive 'Session error' event [JPT-591]", async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm._onSessionError();
      expect(fsm.state()).toBe('disconnected');
    });
  });
});
