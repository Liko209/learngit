/// <reference path="../../__tests__/types.d.ts" />
import {
  RTCSipCallSession,
  SIP_CALL_SESSION_STATE,
  WEBPHONE_STATE,
} from '../RTCSipCallSession';

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

  describe('setsession()', () => {
    it('should _session is null when initialization JPT-573', () => {
      const sipcallsession = new RTCSipCallSession();
      expect(sipcallsession.getSession()).toBe(null);
    });

    it('should session is not null when setSession() be called .JPT-574', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      expect(sipcallsession.getSession()).toBe(vsession);
    });
  });

  describe('hangup()', () => {
    it('should VirtueSession hangup be called when SipCallSession hangup be called .JPT-575', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(vsession, 'hangup');
      sipcallsession.hangup();
      expect(vsession.hangup).toHaveBeenCalled();
    });

    it('should no exception when hangup() is called if setSession() not called JPT-577', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      jest.spyOn(sipcallsession, 'hangup');
      sipcallsession.hangup();
      expect(sipcallsession.hangup).toHaveBeenCalled();
    });
  });

  describe('_onSession*******()', () => {
    it('should _onSessionConfirmed be called when VirtueSession emit Confirmed JPT-576', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionConfirmed');
      vsession.emitSessionConfirmed();
      expect(sipcallsession._onSessionConfirmed).toHaveBeenCalled();
    });

    it('should _onSessionDisconnected be called when VirtueSession emit Disconnected JPT-578', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionDisconnected');
      vsession.emitSessionDisconnected();
      expect(sipcallsession._onSessionDisconnected).toHaveBeenCalled();
    });

    it('should _onSessionError be called when VirtueSession emit Error JPT-579', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionError');
      vsession.emitSessionError();
      expect(sipcallsession._onSessionError).toHaveBeenCalled();
    });
  });
});
