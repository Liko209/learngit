/// <reference path="../../__tests__/types.d.ts" />
import { RTCRegistrationFSM } from '../RTCRegistrationFSM';
import { RTCRegistrationManager } from '../RTCRegistrationManager';

// jest.mock('../rtcAccountManager');

describe('Registration FSM', async () => {
  function fsmCreate() {
    const am = new RTCRegistrationManager(null);
    const fsm = new RTCRegistrationFSM(am);
    return fsm;
  }

  describe('instance', () => {
    it('Should call onInit', async () => {
      const fsm = fsmCreate();
      expect(fsm.state).toBe('idle');
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
