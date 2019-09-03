/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-26 13:16:41
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationFSM } from '../RTCRegistrationFSM';
import { IRTCRegistrationFsmDependency } from '../IRTCRegistrationFsmDependency';
import { REGISTRATION_FSM_STATE } from '../types';

class MockHandler implements IRTCRegistrationFsmDependency {
  onNetworkChangeToOnlineAction = jest.fn();
  onMakeOutgoingCallAction = jest.fn();
  onReceiveIncomingInviteAction = jest.fn();
  onProvisionReadyAction = jest.fn();
  onReRegisterAction = jest.fn();
  onUnregisterAction = jest.fn();
  onSwitchBackProxyAction = jest.fn();
}

const provisionData = 'provisionData';
const options = 'options';
const newProvisionData = 'newProvisionData';

describe('RTCRegistrationFSM', () => {
  describe('create', () => {
    it('Should be idle state when create', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IDLE);
    });
  });

  describe('provisionReady', () => {
    let mockHandler: IRTCRegistrationFsmDependency;
    let fsm: RTCRegistrationFSM;
    function setup() {
      mockHandler = new MockHandler();
      fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
    }
    it('Should transition from idle state to regInProgress state when provision is ready [JPT-522]', () => {
      setup();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IN_PROGRESS);
      expect(mockHandler.onProvisionReadyAction).toHaveBeenCalledWith(
        provisionData,
        options,
      );
    });

    it('Should transition from Failed state to regInProgress state when receive new provisioning event. [JPT-1199]', () => {
      setup();
      fsm.regFailed();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.FAILURE);
      fsm.provisionReady(newProvisionData, options);
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IN_PROGRESS);
      expect(mockHandler.onProvisionReadyAction).toHaveBeenCalledWith(
        newProvisionData,
        options,
      );
    });

    it('Should transition from InProgress state to regInProgress state when receive new provisioning event. [JPT-1200]', () => {
      setup();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IN_PROGRESS);
      fsm.provisionReady(newProvisionData, options);
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IN_PROGRESS);
      expect(mockHandler.onProvisionReadyAction).toHaveBeenCalledWith(
        newProvisionData,
        options,
      );
    });

    it('Should transition from InProgress state to regInProgress state when receive new provisioning event. [JPT-1201]', () => {
      setup();
      fsm.regSuccess();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
      fsm.provisionReady(newProvisionData, options);
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.IN_PROGRESS);
      expect(mockHandler.onProvisionReadyAction).toHaveBeenCalledWith(
        newProvisionData,
        options,
      );
    });
  });

  describe('regSucceed', () => {
    it('Should transition from regInProgress state to ready state when regSucceed fired in regInProgress state [JPT-523]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSuccess();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
    });

    it('Should transition from ready state to ready state when regSucceed fired in ready state [JPT-530]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSuccess();
      fsm.regSuccess();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
    });

    it('Should transition from failed state to ready state when regSucceed fired in ready state [JPT-529]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regFailed();
      fsm.regSuccess();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.READY);
    });
  });

  describe('regError', () => {
    it('Should transition from regInProgress state to regFailure state when error [JPT-560]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regFailed();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.FAILURE);
    });

    it('Should transition from ready state to regFailure state when error [JPT-761]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSuccess();
      fsm.regFailed();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.FAILURE);
    });
  });

  describe('unRegister', () => {
    it('Should transition from ready state to unRegistered state when unRegister fired in ready state [JPT-653]', () => {
      const mockHandler = new MockHandler();
      const fsm = new RTCRegistrationFSM(mockHandler);
      fsm.provisionReady(provisionData, options);
      fsm.regSuccess();
      fsm.unregister();
      expect(fsm.state).toBe(REGISTRATION_FSM_STATE.UNREGISTERED);
    });
  });
});
