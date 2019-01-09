/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationManager } from '../RTCRegistrationManager';
import { IRTCAccountDelegate } from '../../api/IRTCAccountDelegate';
import { RTC_ACCOUNT_STATE } from '../../api/types';
import { UA_EVENT } from '../../signaling/types';
import { EventEmitter2 } from 'eventemitter2';

class MockAccountListener implements IRTCAccountDelegate {
  onAccountStateChanged = jest.fn();
  onReceiveIncomingCall = jest.fn();
}

class MockUserAgent {
  private _eventEmitter: EventEmitter2;
  constructor(eventEmitter: EventEmitter2, flag: boolean) {
    this._eventEmitter = eventEmitter;
    if (flag) {
      this._eventEmitter.emit(UA_EVENT.REG_SUCCESS);
    } else {
      this._eventEmitter.emit(UA_EVENT.REG_FAILED);
    }
  }

  public deRegister() {
    this._eventEmitter.emit(UA_EVENT.REG_UNREGISTER);
  }

  public mockIncomingCall() {
    const session = {
      displayName: 'test',
      uri: { aor: 'test@ringcentral.com' },
    };
    this._eventEmitter.emit(UA_EVENT.RECEIVE_INVITE, session);
  }

  makeCall = jest.fn();
}

const provisionData = 'provisionData';
const options = 'options';
const phoneNumber = 'phoneNumber';

describe('RTCRegistrationManager', () => {
  describe('provisionReady', () => {
    it('Should  Report registered state to upper layer when account state transient to registered [JPT-528]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.REGISTERED,
      );
    });

    it('Should  Report regInProgress state to upper layer when account state transient to regInProgress [JPT-524]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.IN_PROGRESS,
      );
    });
    it('Should  Report failed state to upper layer when account state transient to failed [JPT-525]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      regManager._userAgent = new MockUserAgent(
        regManager._eventEmitter,
        false,
      );
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.FAILED,
      );
    });
    it('Should  Report unRegistered state to upper layer when account state transient to unRegistered [JPT-562]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      regManager._userAgent.deRegister();
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        RTC_ACCOUNT_STATE.UNREGISTERED,
      );
    });
  });

  describe('reRegister()', () => {
    it('Should call the onReRegisterAction function when FSM state in regInProgress, ready, regFailed', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest.spyOn(regManager, 'onReRegisterAction').mockImplementation(() => {});
      regManager.provisionReady('provisionData', 'options');
      expect(regManager._fsm.state).toBe('regInProgress');
      regManager.reRegister();
      expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
      expect(regManager._fsm.state).toBe('regInProgress');

      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      expect(regManager._fsm.state).toBe('ready');
      regManager.reRegister();
      expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
      expect(regManager._fsm.state).toBe('regInProgress');

      regManager._userAgent = new MockUserAgent(
        regManager._eventEmitter,
        false,
      );
      expect(regManager._fsm.state).toBe('regFailure');
      regManager.reRegister();
      expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
      expect(regManager._fsm.state).toBe('regInProgress');
    });
  });

  describe('makeCall()', () => {
    it('Should call the makeCall function of WebPhone when RTCRegManager makeCall', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady('provisionData', 'options');
      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      regManager.createOutgoingCallSession(phoneNumber, options);
      expect(regManager._userAgent.makeCall).toHaveBeenCalledWith(
        phoneNumber,
        options,
      );
    });
  });

  describe('receive incoming call', () => {
    it('Should call onReceiveInvite when user agent trigger receive incoming signal', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady('provisionData', 'options');
      jest.spyOn(regManager, '_onReceiveInvite');
      const ua = new MockUserAgent(regManager._eventEmitter, true);
      regManager._userAgent = ua;
      ua.mockIncomingCall();
      expect(regManager._onReceiveInvite).toHaveBeenCalled();
    });
  });
});
