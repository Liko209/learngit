/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-26 13:16:41
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationFSM, IConditionalHandler } from '../RTCRegistrationFSM';
import { RegistrationState } from '../types';

describe('RTCRegistrationFSM', async () => {
  class MockHandler implements IConditionalHandler {
    onReadyWhenRegSucceed(): string {
      return RegistrationState.READY;
    }
  }

  describe('create', () => {
    it('Should be idle state when create', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      expect(fsm.state).toBe(RegistrationState.IDLE);
    });
  });

  describe('provisionReady', () => {
    it('Should transition from idle state to regInProgress state when provision is ready [JPT-522]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady();
      expect(fsm.state).toBe(RegistrationState.REG_IN_PROGRESS);
    });
  });

  describe('regSucceed', () => {
    it('Should transition from regInProgress state to ready state when regSucceed fired in regInProgress state [JPT-523]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady();
      fsm.regSucceed();
      expect(fsm.state).toBe(RegistrationState.READY);
    });

    it('Should transition from ready state to ready state when regSucceed fired in ready state [JPT-530]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      jest.spyOn(mockHandler, 'onReadyWhenRegSucceed');
      fsm.provisionReady();
      fsm.regSucceed();
      fsm.regSucceed();
      expect(fsm.state).toBe(RegistrationState.READY);
      expect(mockHandler.onReadyWhenRegSucceed).toHaveBeenCalled();
    });
  });

  describe('regTimeOut', () => {
    it('Should transition from ready state to regFailure state when time out [JPT-526]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady();
      fsm.regTimeOut();
      expect(fsm.state).toBe(RegistrationState.REG_FAILURE);
    });
  });

  describe('regError', () => {
    it('Should transition from ready state to regFailure state when error [JPT-560]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady();
      fsm.regError();
      expect(fsm.state).toBe(RegistrationState.REG_FAILURE);
    });
  });

  describe('unRegister', () => {
    it('Should transition from ready state to unRegistered state when unRegister fired in ready state [JPT-653]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady();
      fsm.regSucceed();
      fsm.unRegister();
      expect(fsm.state).toBe(RegistrationState.UN_REGISTERED);
    });
  });
});
