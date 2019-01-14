/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationManager } from '../RTCRegistrationManager';
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
  reRegister = jest.fn();

  mockSignal(signal: string) {
    this.emit(signal);
  }
}

const provisionData = 'provisionData';
const options = 'options';
const phoneNumber = 'phoneNumber';

describe('RTCRegistrationManager', () => {
  describe('reRegister()', async () => {
    function initRegManager(regManager: RTCRegistrationManager) {
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest.spyOn(regManager, '_onEnterReady').mockImplementation(() => {});
      jest.spyOn(regManager, '_onEnterRegFailure').mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
    }

    it('Should call the onReRegisterAction function when FSM state in regInProgress [JPT-756]', done => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager);
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      regManager.reRegister();
      setImmediate(() => {
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect(regManager._fsm.state).toBe('inProgress');
        expect(ua.reRegister).toHaveBeenCalled();
        done();
      });
    });

    it('Should call the onReRegisterAction function when FSM state in ready [JPT-758]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager);
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      regManager.reRegister();
      setImmediate(() => {
        expect(regManager._onEnterReady).toHaveBeenCalled();
        expect(regManager._fsm.state).toBe('inProgress');
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect(ua.reRegister).toHaveBeenCalled();
      });
    });

    it('Should call the onReRegisterAction function when FSM state in regFailed [JPT-757]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager);
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      ua.mockSignal(UA_EVENT.REG_FAILED);
      regManager.reRegister();
      setImmediate(() => {
        expect(regManager._onEnterRegFailure).toHaveBeenCalled();
        expect(regManager._fsm.state).toBe('inProgress');
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect(ua.reRegister).toHaveBeenCalled();
      });
    });
  });

  describe('makeCall()', () => {
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
