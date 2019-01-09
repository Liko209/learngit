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

class MockUserAgent extends EventEmitter2 {
  constructor() {
    super();
  }

  public deRegister() {
    this.emit(UA_EVENT.REG_UNREGISTER);
  }

  public mockIncomingCall() {
    const session = {
      displayName: 'test',
      uri: { aor: 'test@ringcentral.com' },
    };
    this.emit(UA_EVENT.RECEIVE_INVITE, session);
  }

  makeCall = jest.fn();

  mockSignal(signal: string) {
    this.emit(signal);
  }
}

const provisionData = 'provisionData';
const options = 'options';
const phoneNumber = 'phoneNumber';

describe('RTCRegistrationManager', () => {
  describe('makeCall', () => {
    it('Should call the makeCall function of WebPhone when RTCRegManager makeCall', () => {
      const regManager = new RTCRegistrationManager();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady('provisionData', 'options');
      regManager._userAgent = new MockUserAgent();
      regManager._initUserAgentListener();
      regManager.createOutgoingCallSession(phoneNumber, options);
      expect(regManager._userAgent.makeCall).toHaveBeenCalledWith(
        phoneNumber,
        options,
      );
    });
  });
  describe('receive incoming call', () => {
    it('Should call onReceiveInvite when user agent trigger receive incoming signal', () => {
      const regManager = new RTCRegistrationManager();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady('provisionData', 'options');
      jest.spyOn(regManager, '_onUAReceiveInvite');
      const ua = new MockUserAgent();
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      ua.mockIncomingCall();
      expect(regManager._onUAReceiveInvite).toHaveBeenCalled();
    });
  });
});
