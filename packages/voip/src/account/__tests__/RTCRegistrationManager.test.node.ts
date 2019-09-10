/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-27 11:14:52
 * Copyright © RingCentral. All rights reserved.
 */
import { RTCRegistrationManager } from '../RTCRegistrationManager';
import { UA_EVENT } from '../../signaling/types';
import { RTCUserInfo, RTCCallOptions } from '../../api/types';
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
  unregister = jest.fn();

  mockSignal(signal: string) {
    this.emit(signal);
  }
}
const userInfo: RTCUserInfo = {};
const provisionData = 'provisionData';
const options: RTCCallOptions = {};
const phoneNumber = 'phoneNumber';

describe('RTCRegistrationManager', () => {
  describe('reRegister()', () => {
    function initRegManager(regManager: RTCRegistrationManager) {
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest
        .spyOn(regManager as any, '_onEnterReady')
        .mockImplementation(() => {});
      jest
        .spyOn(regManager as any, '_onEnterRegFailure')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
    }

    it('Should call the onReRegisterAction function when FSM state in regInProgress [JPT-756]', done => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager);
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
      regManager.reRegister();
      setImmediate(() => {
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(ua.reRegister).toHaveBeenCalled();
        done();
      });
    });

    it('Should call the onReRegisterAction function when FSM state in ready [JPT-758]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager);
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      regManager.reRegister();
      setImmediate(() => {
        expect((regManager as any)._onEnterReady).toHaveBeenCalled();
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect(ua.reRegister).toHaveBeenCalled();
      });
    });

    it('Should call the onReRegisterAction function when FSM state in regFailed [JPT-757]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager);
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
      ua.mockSignal(UA_EVENT.REG_FAILED);
      regManager.reRegister();
      setImmediate(() => {
        expect((regManager as any)._onEnterRegFailure).toHaveBeenCalled();
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(regManager.onProvisionReadyAction).toHaveBeenCalled();
        expect(ua.reRegister).toHaveBeenCalled();
      });
    });
  });
  describe('Registration failed retry', () => {
    let regManager: RTCRegistrationManager;
    let ua: MockUserAgent;
    function setup() {
      regManager = new RTCRegistrationManager(userInfo);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      ua = new MockUserAgent();
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
      regManager.provisionReady(provisionData, options);
    }
  });

  describe('networkChangeToOnline()', () => {
    function initRegManager(
      regManager: RTCRegistrationManager,
      ua: MockUserAgent,
    ) {
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest.spyOn(regManager, 'reRegister').mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
    }

    it('Should call reRegister() and FSM.state is "inProgress" when networkChangeToOnline() is called and FSM.state is "inProgress" [JPT-798]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should call reRegister() and FSM.state is "ready" when networkChangeToOnline() is called and FSM.state is "ready" [JPT-800]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should call reRegister() and FSM.state is "failed" when networkChangeToOnline() is called and FSM.state is "failed" [JPT-799]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_FAILED);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect((regManager as any)._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should do nothing when networkChangeToOnline() is called and FSM.state is "idle" [JPT-801]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest.spyOn(regManager, 'reRegister').mockImplementation(() => {});
      (regManager as any)._userAgent = ua;
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect((regManager as any)._fsm.state).toBe('idle');
        expect(regManager.reRegister).not.toHaveBeenCalledWith();
      });
    });

    it('Should do nothing when networkChangeToOnline() is called and FSM.state is "unregistered" [JPT-802]', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      ua.mockSignal(UA_EVENT.REG_UNREGISTER);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect((regManager as any)._fsm.state).toBe('unregistered');
        expect(regManager.reRegister).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('makeCall()', () => {
    it('Should call the makeCall function of WebPhone when RTCRegManager makeCall', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      (regManager as any)._userAgent = new MockUserAgent();
      (regManager as any)._initUserAgentListener();
      regManager.createOutgoingCallSession(phoneNumber, options);
      expect((regManager as any)._userAgent.makeCall).toHaveBeenCalledWith(
        phoneNumber,
        options,
      );
    });
  });

  describe('receive incoming call', () => {
    it('Should call onReceiveInvite when user agent trigger receive incoming signal', () => {
      const regManager = new RTCRegistrationManager(userInfo);
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
      jest.spyOn(regManager as any, '_onUAReceiveInvite');
      const ua = new MockUserAgent();
      (regManager as any)._userAgent = ua;
      (regManager as any)._initUserAgentListener();
      ua.mockIncomingCall();
      expect((regManager as any)._onUAReceiveInvite).toHaveBeenCalled();
    });
  });
});
