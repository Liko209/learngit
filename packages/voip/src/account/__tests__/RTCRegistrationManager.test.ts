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
  unregister = jest.fn();

  mockSignal(signal: string) {
    this.emit(signal);
  }
}

const provisionData = 'provisionData';
const options = 'options';
const phoneNumber = 'phoneNumber';

describe('RTCRegistrationManager', () => {
  describe('reRegister()', () => {
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
  describe('Registration failed retry', () => {
    let regManager: RTCRegistrationManager;
    let ua: MockUserAgent;
    function setup() {
      regManager = new RTCRegistrationManager();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      ua = new MockUserAgent();
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      regManager.provisionReady(provisionData, options);
    }

    it('Should send reRegister when retry timer reached. [JPT-812]', done => {
      jest.useFakeTimers();
      setup();
      jest.spyOn(regManager, 'reRegister');
      ua.mockSignal(UA_EVENT.REG_FAILED);
      setImmediate(() => {
        jest.advanceTimersByTime(60 * 1000);
        expect(regManager.reRegister).toBeCalled();
        done();
      });
    });

    it('Should follow back off algorithm for register retry interval[JPT-2304]', () => {
      setup();
      const expectedInterval = [
        { min: 2, max: 6 },
        { min: 10, max: 20 },
        { min: 20, max: 40 },
        { min: 40, max: 80 },
        { min: 80, max: 120 },
        { min: 80, max: 120 },
        { min: 80, max: 120 },
        { min: 80, max: 120 },
        { min: 80, max: 120 },
        { min: 120, max: 240 },
        { min: 240, max: 480 },
        { min: 480, max: 960 },
        { min: 960, max: 1920 },
        { min: 1920, max: 3840 },
      ];
      let interval = 0;
      for (let i = 0; i < 20; i++) {
        interval = regManager._calculateNextRetryInterval();
        if (i < expectedInterval.length) {
          expect(interval).toBeGreaterThanOrEqual(expectedInterval[i].min);
          expect(interval).toBeLessThanOrEqual(expectedInterval[i].max);
        } else {
          expect(interval).toBeGreaterThanOrEqual(1920);
          expect(interval).toBeLessThanOrEqual(3840);
        }
        regManager._failedTimes++;
      }
    });
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
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
    }

    it('Should call reRegister() and FSM.state is "inProgress" when networkChangeToOnline() is called and FSM.state is "inProgress" [JPT-798]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect(regManager._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should call reRegister() and FSM.state is "ready" when networkChangeToOnline() is called and FSM.state is "ready" [JPT-800]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect(regManager._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should call reRegister() and FSM.state is "failed" when networkChangeToOnline() is called and FSM.state is "failed" [JPT-799]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_FAILED);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect(regManager._fsm.state).toBe('inProgress');
        expect(regManager.reRegister).toHaveBeenCalledWith();
      });
    });

    it('Should do nothing when networkChangeToOnline() is called and FSM.state is "idle" [JPT-801]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      jest.spyOn(regManager, 'reRegister').mockImplementation(() => {});
      regManager._userAgent = ua;
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect(regManager._fsm.state).toBe('idle');
        expect(regManager.reRegister).not.toHaveBeenCalledWith();
      });
    });

    it('Should do nothing when networkChangeToOnline() is called and FSM.state is "unregistered" [JPT-802]', () => {
      const regManager = new RTCRegistrationManager();
      const ua = new MockUserAgent();
      initRegManager(regManager, ua);
      ua.mockSignal(UA_EVENT.REG_SUCCESS);
      ua.mockSignal(UA_EVENT.REG_UNREGISTER);
      regManager.networkChangeToOnline();
      setImmediate(() => {
        expect(regManager._fsm.state).toBe('unregistered');
        expect(regManager.reRegister).not.toHaveBeenCalledWith();
      });
    });
  });

  describe('makeCall()', () => {
    it('Should call the makeCall function of WebPhone when RTCRegManager makeCall', () => {
      const regManager = new RTCRegistrationManager();
      jest
        .spyOn(regManager, 'onProvisionReadyAction')
        .mockImplementation(() => {});
      regManager.provisionReady(provisionData, options);
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
      regManager.provisionReady(provisionData, options);
      jest.spyOn(regManager, '_onUAReceiveInvite');
      const ua = new MockUserAgent();
      regManager._userAgent = ua;
      regManager._initUserAgentListener();
      ua.mockIncomingCall();
      expect(regManager._onUAReceiveInvite).toHaveBeenCalled();
    });
  });
});
