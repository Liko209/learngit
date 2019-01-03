/// <reference path="../../__tests__/types.d.ts" />
import { RTCSipCallSession, WEBPHONE_STATE } from '../RTCSipCallSession';

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

    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();
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

  describe('flip()', () => {
    it('should VirtueSession flip be called when SipCallSession flip be called', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      vsession.flip.mockResolvedValue();
      sipcallsession.flip(5);
      expect(vsession.flip).toHaveBeenCalledWith(5);
    });
  });

  describe('startRecord()', () => {
    it('should VirtueSession startRecord be called when SipCallSession startRecord be called', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      vsession.startRecord.mockResolvedValue();
      sipcallsession.startRecord();
      expect(vsession.startRecord).toHaveBeenCalled();
    });

    it('should VirtueSession startRecord be called 1 time when SipCallSession startRecord be called 2 times', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      vsession.startRecord.mockResolvedValue();
      sipcallsession.startRecord();
      sipcallsession.startRecord();
      expect(vsession.startRecord).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopRecord()', () => {
    it('should VirtueSession stopRecord be called when SipCallSession stopRecord be called and is recording', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      vsession.stopRecord.mockResolvedValue();
      vsession.startRecord.mockResolvedValue();
      sipcallsession.startRecord();
      sipcallsession.stopRecord();
      expect(vsession.stopRecord).toHaveBeenCalled();
    });

    it('should VirtueSession stopRecord not be called when SipCallSession stopRecord be called and is not recording', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtueSession();
      sipcallsession.setSession(vsession);
      vsession.stopRecord.mockResolvedValue();
      sipcallsession.stopRecord();
      expect(vsession.stopRecord).not.toHaveBeenCalled();
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
