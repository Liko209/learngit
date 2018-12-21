/// <reference path="../../__tests__/types.d.ts" />
import {
  SipCallSession,
  SIP_CALL_SESSION_STATE,
  WEBPHONE_STATE,
} from '../sipCallSession';

import { EventEmitter2 } from 'eventemitter2';

describe('sip call session', () => {
  class VirtueSession extends EventEmitter2 {
    constructor() {
      super();
    }

    emitSessionConfirmed() {
      this.emit(WEBPHONE_STATE.ACCEPTED);
    }

    emitSessionDisconnected() {
      this.emit(WEBPHONE_STATE.BYE);
    }

    emitSessionError() {
      this.emit(WEBPHONE_STATE.FAILED);
    }

    hangup() {}
  }

  describe('should get session when ues setsession', () => {
    it('session is null when initialization', () => {
      const sipcallsession = new SipCallSession();
      expect(sipcallsession.getSession()).toBe(null);
    });

    it('session is not null after setSession() be called', () => {
      const sipcallsession = new SipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      expect(sipcallsession.getSession()).toBe(vsession);
    });
  });

  describe('should VirtueSession hangup be called when SipCallSession hangup be called', () => {
    it('hangup be called', () => {
      const sipcallsession = new SipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(vsession, 'hangup');
      sipcallsession.hangup();
      expect(vsession.hangup).toHaveBeenCalled();
    });
  });

  describe('should SipCallSession listen function be called when VirtueSession emit event', () => {
    it('_onSessionConfirmed be called', () => {
      const sipcallsession = new SipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionConfirmed');
      vsession.emitSessionConfirmed();
      expect(sipcallsession._onSessionConfirmed).toHaveBeenCalled();
    });

    it('_onSessionDisconnected be called', () => {
      const sipcallsession = new SipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionDisconnected');
      vsession.emitSessionDisconnected();
      expect(sipcallsession._onSessionDisconnected).toHaveBeenCalled();
    });

    it('_onSessionError be called', () => {
      const sipcallsession = new SipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionError');
      vsession.emitSessionError();
      expect(sipcallsession._onSessionError).toHaveBeenCalled();
    });
  });
});
