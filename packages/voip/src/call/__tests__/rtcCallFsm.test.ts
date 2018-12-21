/// <reference path="../../__tests__/types.d.ts" />
import { RtcCallFsm } from '../rtcCallFsm';
import { async } from 'q';
import { create } from 'domain';

describe('Call FSM UT', async () => {
  class MockCallFsmLisener {
    private _fsm: RtcCallFsm;
    constructor(fsm: RtcCallFsm) {
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
    const ret = new RtcCallFsm();
    return ret;
  }

  describe('Idle state transitions', async () => {
    it('Account not ready event => Pending state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterPending');
      fsm.accountNotReady();
      expect(fsm.state()).toBe('pending');
      expect(listener.onEnterPending).toBeCalled();
    });

    it('Account ready event => Connecting state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnecting');
      fsm.accountReady();
      expect(fsm.state()).toBe('connecting');
      expect(listener.onEnterConnecting).toBeCalled();
    });

    it('Hangup event => Disconnected state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.hangup();
      expect(fsm.state()).toBe('disconnected');
      expect(listener.onEnterDisconnected).toBeCalled();
    });
  });

  describe('Pending state transitions', async () => {
    it('Account ready event => Connecting state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm._fsmGoto('pending');
      jest.spyOn(listener, 'onEnterConnecting');
      fsm.accountReady();
      expect(fsm.state()).toBe('connecting');
      expect(listener.onEnterConnecting).toBeCalled();
    });

    it('Hangup event => Disconnected state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      fsm._fsmGoto('pending');
      jest.spyOn(listener, 'onEnterDisconnected');
      fsm.hangup();
      expect(fsm.state()).toBe('disconnected');
      expect(listener.onEnterDisconnected).toBeCalled();
    });
  });

  describe('Connecting state transitions', async () => {
    it('Session confirmed event => Connected state', async () => {
      const fsm = createFsm();
      const listener = new MockCallFsmLisener(fsm);
      jest.spyOn(listener, 'onEnterConnected');
      fsm._fsmGoto('connecting');
      fsm.sessionConfirmed();
      expect(fsm.state()).toBe('connected');
      expect(listener.onEnterConnected).toBeCalled();
    });

    it('Hangup event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm.hangup();
      expect(fsm.state()).toBe('disconnected');
    });

    it('Session error event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm.sessionError();
      expect(fsm.state()).toBe('disconnected');
    });

    it('Session disconnected event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connecting');
      fsm.sessionDisconnected();
      expect(fsm.state()).toBe('disconnected');
    });
  });

  describe('Connected state transitions', async () => {
    it('Hangup event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm.hangup();
      expect(fsm.state()).toBe('disconnected');
    });

    it('Session error event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm.sessionError();
      expect(fsm.state()).toBe('disconnected');
    });

    it('Session disconnected event => Disconnected state', async () => {
      const fsm = createFsm();
      fsm._fsmGoto('connected');
      fsm.sessionDisconnected();
      expect(fsm.state()).toBe('disconnected');
    });
  });
});
