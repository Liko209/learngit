/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-26 13:16:41
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationFSM } from '../RTCRegistrationFSM';
import { IConditionalHandler } from '../IConditionalHandler';
import { RegistrationState } from '../types';

class MockHandler implements IConditionalHandler {
  onReadyWhenRegSucceedAction = jest.fn();
  onProvisionReadyAction = jest.fn();
}

const provisionData = 'provisionData';
const options = 'options';

describe('RTCRegistrationFSM', () => {
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
      fsm.provisionReady(provisionData, options);
      expect(fsm.state).toBe(RegistrationState.REG_IN_PROGRESS);
      expect(mockHandler.onProvisionReadyAction).toHaveBeenCalledWith(
        provisionData,
        options,
      );
    });
  });

  describe('regSucceed', () => {
    it('Should transition from regInProgress state to ready state when regSucceed fired in regInProgress state [JPT-523]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSucceed();
      expect(fsm.state).toBe(RegistrationState.READY);
    });

    it('Should transition from ready state to ready state when regSucceed fired in ready state [JPT-530]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSucceed();
      fsm.regSucceed();
      expect(fsm.state).toBe(RegistrationState.READY);
      expect(mockHandler.onReadyWhenRegSucceedAction).toHaveBeenCalled();
    });
  });

  describe('regTimeOut', () => {
    it('Should transition from regInProgress state to regFailure state when time out [JPT-526]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regTimeOut();
      expect(fsm.state).toBe(RegistrationState.REG_FAILURE);
    });
  });

  describe('regError', () => {
    it('Should transition from regInProgress state to regFailure state when error [JPT-560]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regError();
      expect(fsm.state).toBe(RegistrationState.REG_FAILURE);
    });
  });

  describe('unRegister', () => {
    it('Should transition from ready state to unRegistered state when unRegister fired in ready state [JPT-653]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSucceed();
      fsm.unRegister();
      expect(fsm.state).toBe(RegistrationState.UN_REGISTERED);
    });
  });
});
