/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationManager } from '../RTCRegistrationManager';
import { IRTCAccountListener } from '../../api/IRTCAccountListener';
import { AccountState } from '../../api/types';
import { UA_EVENT } from '../../signaling/types';
import { EventEmitter2 } from 'eventemitter2';

describe('RTCRegistrationManager', () => {
  class MockAccountListener implements IRTCAccountListener {
    onAccountStateChanged = jest.fn();
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
  }

  const provisionData = 'provisionData';
  const options = 'options';

  describe('provisionReady', () => {
    it('Should  Report registered state to upper layer when account state transient to registered [JPT-528]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      regManager.provisionReady(provisionData, options);
      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        AccountState.REGISTERED,
      );
    });

    it('Should  Report regInProgress state to upper layer when account state transient to regInProgress [JPT-524]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      regManager.provisionReady(provisionData, options);
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        AccountState.IN_PROGRESS,
      );
    });
    it('Should  Report failed state to upper layer when account state transient to failed [JPT-525]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      regManager.provisionReady(provisionData, options);
      regManager._userAgent = new MockUserAgent(
        regManager._eventEmitter,
        false,
      );
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        AccountState.FAILED,
      );
    });
    it('Should  Report unRegistered state to upper layer when account state transient to unRegistered [JPT-562]', () => {
      const mockListener = new MockAccountListener();
      const regManager = new RTCRegistrationManager(mockListener);
      regManager.provisionReady(provisionData, options);

      regManager._userAgent = new MockUserAgent(regManager._eventEmitter, true);
      regManager._userAgent.deRegister();
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        AccountState.UNREGISTERED,
      );
    });
  });

  describe('makeCall', () => {
    it('Should return session when register success', () => {
      const mockListener = new MockAccountListener();
      const fsmManager = new RTCRegistrationManager(mockListener);
      fsmManager.provisionReady('provisionData', 'options');
      const session = fsmManager.makeCall('phoneNumber', 'options');
      expect(session).toEqual('session');
    });
  });
});
