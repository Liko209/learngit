/// <reference path="../../__tests__/types.d.ts" />
import { RTCSipCallSession, WEBPHONE_STATE } from '../RTCSipCallSession';
import { EventEmitter2 } from 'eventemitter2';

describe('sip call session', () => {
  class VirtualSession extends EventEmitter2 {
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
    accept() {}
    reject() {}
    sendToVoicemail() {}
  }

  describe('setsession()', () => {
    it('should _session is null when initialization JPT-573', () => {
      const sipcallsession = new RTCSipCallSession();
      expect(sipcallsession.getSession()).toBe(null);
    });

    it('should session is not null when setSession() be called .JPT-574', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      expect(sipcallsession.getSession()).toBe(vsession);
    });
  });

  describe('hangup()', () => {
    it('should VirtueSession hangup be called when SipCallSession hangup be called .JPT-575', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(vsession, 'hangup');
      sipcallsession.hangup();
      expect(vsession.hangup).toHaveBeenCalled();
    });

    it('should no exception when hangup() is called if setSession() not called JPT-577', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      jest.spyOn(sipcallsession, 'hangup');
      sipcallsession.hangup();
      expect(sipcallsession.hangup).toHaveBeenCalled();
    });
  });

  describe('answer()', () => {
    it('Virtuel Session answer should be called when SipCallSession hangup is called', () => {
      const callSession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      jest.spyOn(vsession, 'accept');
      callSession.answer();
      expect(vsession.accept).toHaveBeenCalled();
    });
    it('Should not crash when answer() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession();
      jest.spyOn(callSession, 'answer');
      callSession.answer();
      expect(callSession.answer).toHaveBeenCalled();
    });
  });

  describe('reject()', () => {
    it('Virtuel Session answer should be called when SipCallSession hangup is called', () => {
      const callSession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      jest.spyOn(vsession, 'reject');
      callSession.reject();
      expect(vsession.reject).toHaveBeenCalled();
    });
    it('Should not crash when reject() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession();
      jest.spyOn(callSession, 'reject');
      callSession.reject();
      expect(callSession.reject).toHaveBeenCalled();
    });
  });

  describe('sendToVoicemail()', () => {
    it('Virtuel Session sendToVoicemail() should be called when SipCallSession sendToVoicemail is called', () => {
      const callSession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      jest.spyOn(vsession, 'sendToVoicemail');
      callSession.sendToVoicemail();
      expect(vsession.sendToVoicemail).toHaveBeenCalled();
    });
    it('Should not crash when reject() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession();
      jest.spyOn(callSession, 'sendToVoicemail');
      callSession.sendToVoicemail();
      expect(callSession.sendToVoicemail).toHaveBeenCalled();
    });
  });

  describe('_onSession*******()', () => {
    it('should _onSessionConfirmed be called when VirtueSession emit Confirmed JPT-576', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionConfirmed');
      vsession.emitSessionConfirmed();
      expect(sipcallsession._onSessionConfirmed).toHaveBeenCalled();
    });

    it('should _onSessionDisconnected be called when VirtueSession emit Disconnected JPT-578', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionDisconnected');
      vsession.emitSessionDisconnected();
      expect(sipcallsession._onSessionDisconnected).toHaveBeenCalled();
    });

    it('should _onSessionError be called when VirtueSession emit Error JPT-579', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionError');
      vsession.emitSessionError();
      expect(sipcallsession._onSessionError).toHaveBeenCalled();
    });
  });
});
