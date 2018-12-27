/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationManager } from '../RTCRegistrationManager';
import { IRTCAccountListener, AccountState } from '../../api/RTCAccount';

describe('RTCRegistrationManager', () => {
  class MockAccountListener implements IRTCAccountListener {
    onAccountStateChanged = jest.fn();
  }

  describe('provisionReady', () => {
    it('Should trigger register func', () => {
      const mockListener = new MockAccountListener();
      const fsmManager = new RTCRegistrationManager(mockListener);
      fsmManager.provisionReady('provisionData', 'options');
      expect(mockListener.onAccountStateChanged).toHaveBeenCalledWith(
        AccountState.IDLE,
        AccountState.IN_PROGRESS,
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
