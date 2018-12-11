/// <reference path="../../__tests__/types.d.ts" />
import { RTCAccountFSM } from '../rtcAccountFSM';
import { RTCAccountManager } from '../rtcAccountManager';

// jest.mock('../rtcAccountManager');

describe('Account FSM', async () => {
  function fsmCreate() {
    const am = new RTCAccountManager(null);
    const fsm = new RTCAccountFSM(am);
    return fsm;
  }

  describe('instance', () => {
    it('instance will trigger onInit', async () => {
      const fsm = fsmCreate();
      expect(fsm.state).toBe('idle');
      // expect(fsm.socketClient).not.toBeNull();
    });
  });

  describe('state transition', () => {
    it('state transition: idle -> regInProgress', async () => {
      const fsm = fsmCreate();
      fsm.doRegister();
      expect(fsm.state).toBe('regInProgress');
    });

    it('state transition: idle -> regInProgress -> ready ', async () => {
      const fsm = fsmCreate();
      fsm.doRegister();
      fsm.regSucceed();
      expect(fsm.state).toBe('ready');
    });

    it('state transition: network change in ready', async () => {
      const am = new RTCAccountManager(null);
      jest.spyOn(am, 'processReadyOnNetworkChanged');
      const fsm = new RTCAccountFSM(am);
      fsm.doRegister();
      fsm.regSucceed();
      fsm.networkChanged();
      fsm.doRegister();
      expect(fsm.state).toBe('regInProgress');
      expect(am.processReadyOnNetworkChanged).toHaveReturnedWith('ready');
    });

    it('SIP refresh while state is in ready', async () => {
      const am = new RTCAccountManager(null);
      jest.spyOn(am, 'processReadyOnRegSucceed');
      const fsm = new RTCAccountFSM(am);
      fsm.doRegister();
      fsm.regSucceed();
      fsm.regSucceed();
      expect(fsm.state).toBe('ready');
      expect(am.processReadyOnRegSucceed).toHaveBeenCalled();
    });

    it('state transition: ready -> unRegInProgress', async () => {
      const fsm = fsmCreate();
      fsm.doRegister();
      fsm.regSucceed();
      fsm.deRegister();
      expect(fsm.state).toBe('unRegInProgress');
    });

    it('state transition: idle -> regInProgress -> ready -> unRegInProgress -> none', async () => {
      const fsm = fsmCreate();
      fsm.doRegister();
      fsm.regSucceed();
      fsm.deRegister();
      fsm.deRegSucceed();
      expect(fsm.state).toBe('none');
    });

    it('Failed to register', async () => {
      const fsm = fsmCreate();
      fsm.doRegister();
      fsm.regError('1', '2');
      expect(fsm.state).toBe('regFailure');
    });
  });
});
