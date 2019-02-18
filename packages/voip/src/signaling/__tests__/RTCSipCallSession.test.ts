/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-03 19:44:57
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCSipCallSession } from '../RTCSipCallSession';
import { EventEmitter2 } from 'eventemitter2';
import {
  WEBPHONE_SESSION_STATE,
  WEBPHONE_SESSION_EVENT,
} from '../../signaling/types';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../../call/types';
import { RTC_CALL_ACTION } from '../../api/types';

describe('sip call session', () => {
  class SessionDescriptionHandler extends EventEmitter2 {
    private _directionFlag: boolean = true;
    constructor() {
      super();
    }

    setDirectionFlag(flag: boolean) {
      this._directionFlag = flag;
    }

    getDirection(): string {
      if (this._directionFlag) {
        return 'sendonly';
      }
      return 'sendrecv';
    }
  }
  class VirtualSession extends EventEmitter2 {
    public sessionDescriptionHandler: SessionDescriptionHandler;
    constructor() {
      super();
      this.sessionDescriptionHandler = new SessionDescriptionHandler();
    }
    emitSessionConfirmed() {
      this.emit(WEBPHONE_SESSION_STATE.CONFIRMED);
    }

    emitSessionAccepted() {
      this.emit(WEBPHONE_SESSION_STATE.ACCEPTED);
    }
    emitSessionDisconnected() {
      this.emit(WEBPHONE_SESSION_STATE.BYE);
    }
    emitSessionError() {
      this.emit(WEBPHONE_SESSION_STATE.FAILED);
    }

    emitSdhCreated() {
      this.emit(WEBPHONE_SESSION_EVENT.SDH_CREATED);
    }
    emitTrackAdded() {
      this.sessionDescriptionHandler.emit(
        WEBPHONE_SESSION_EVENT.ADD_TRACK,
        null,
      );
    }

    emitSessionReinviteAccepted() {
      this.emit(WEBPHONE_SESSION_STATE.REINVITE_ACCEPTED, this);
    }

    emitSessionReinviteFailed() {
      this.emit(WEBPHONE_SESSION_STATE.REINVITE_FAILED, this);
    }

    terminate() {}
    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();
    hold = jest.fn();
    unhold = jest.fn();
    accept() {}
    reject() {}
    toVoicemail() {}
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
    it('should VirtueSession terminate be called when SipCallSession hangup be called .JPT-575', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(vsession, 'terminate');
      sipcallsession.hangup();
      expect(vsession.terminate).toHaveBeenCalled();
    });

    it('should no exception when hangup() is called if setSession() not called JPT-577', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      jest.spyOn(sipcallsession, 'hangup');
      sipcallsession.hangup();
      expect(sipcallsession.hangup).toHaveBeenCalled();
    });
  });

  describe('flip()', () => {
    it('should VirtualSession flip be called when SipCallSession flip be called', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      vsession.flip.mockResolvedValue(null);
      sipcallsession.flip(5);
      expect(vsession.flip).toHaveBeenCalledWith(5);
    });
  });

  describe('startRecord()', () => {
    it('should VirtualSession startRecord be called when SipCallSession startRecord be called', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      vsession.startRecord.mockResolvedValue(null);
      sipcallsession.startRecord();
      expect(vsession.startRecord).toHaveBeenCalled();
    });
  });

  let sipcallsession = null;
  let vsession = null;
  function initSession() {
    sipcallsession = new RTCSipCallSession();
    vsession = new VirtualSession();
    sipcallsession.setSession(vsession);
    jest.spyOn(sipcallsession, 'emit');
  }

  describe('hold()', () => {
    it('should notify reinviteAccepted when receive reinviteAccepted event after call "hold" API [JPT-1136]', done => {
      initSession();
      vsession.hold.mockResolvedValue(null);
      sipcallsession.hold();
      vsession.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_ACCEPTED,
          vsession,
        );
        done();
      });
    });

    it('should emit hold failed action when hold failed by return promise reject', done => {
      initSession();
      vsession.hold.mockRejectedValue(null);
      sipcallsession.hold();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.HOLD,
        );
        done();
      });
    });

    it('should notify reinviteFailed when receive reinviteFailed event after call "hold" API [JPT-1135]', done => {
      initSession();
      vsession.hold.mockResolvedValue(null);
      sipcallsession.hold();
      vsession.emitSessionReinviteFailed();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_FAILED,
          vsession,
        );
        done();
      });
    });
  });

  describe('unhold()', () => {
    it('should notify reinviteAccepted when receive reinviteAccepted event after call "unhold" API [1138]', done => {
      initSession();
      vsession.sessionDescriptionHandler.setDirectionFlag(false);
      vsession.unhold.mockResolvedValue(null);
      sipcallsession.unhold();
      vsession.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_ACCEPTED,
          vsession,
        );
        done();
      });
    });

    it('should emit unhold failed action when unhold failed by return promise reject', done => {
      initSession();
      vsession.sessionDescriptionHandler.setDirectionFlag(false);
      vsession.unhold.mockRejectedValue(null);
      sipcallsession.unhold();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.UNHOLD,
        );
        done();
      });
    });

    it('should notify reinviteFailed when receive reinviteFailed event after call "unhold" API [1137]', done => {
      initSession();
      vsession.sessionDescriptionHandler.setDirectionFlag(false);
      vsession.unhold.mockResolvedValue(null);
      sipcallsession.unhold();
      vsession.emitSessionReinviteFailed();
      setImmediate(() => {
        expect(sipcallsession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_FAILED,
          vsession,
        );
        done();
      });
    });
  });

  describe('stopRecord()', () => {
    it('should VirtualSession stopRecord be called when SipCallSession stopRecord be called', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      vsession.stopRecord.mockResolvedValue(null);
      vsession.startRecord.mockResolvedValue(null);
      sipcallsession.startRecord();
      sipcallsession.stopRecord();
      expect(vsession.stopRecord).toHaveBeenCalled();
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
      jest.spyOn(vsession, 'toVoicemail');
      callSession.sendToVoicemail();
      expect(vsession.toVoicemail).toHaveBeenCalled();
    });
    it('Should not crash when reject() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession();
      jest.spyOn(callSession, 'sendToVoicemail');
      callSession.sendToVoicemail();
      expect(callSession.sendToVoicemail).toHaveBeenCalled();
    });
  });

  describe('_onSession*******()', () => {
    it('should _onSessionConfirmed be called when VirtualSession emit Confirmed JPT-576', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionConfirmed');
      vsession.emitSessionConfirmed();
      expect(sipcallsession._onSessionConfirmed).toHaveBeenCalled();
    });

    it('should _onSessionAccepted be called when VirtualSession emit Accepted', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionAccepted');
      vsession.emitSessionAccepted();
      expect(sipcallsession._onSessionAccepted).toHaveBeenCalled();
    });

    it('should _onSessionDisconnected be called when VirtualSession emit Disconnected JPT-578', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionDisconnected');
      vsession.emitSessionDisconnected();
      expect(sipcallsession._onSessionDisconnected).toHaveBeenCalled();
    });

    it('should _onSessionError be called when VirtualSession emit Error JPT-579', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionError');
      vsession.emitSessionError();
      expect(sipcallsession._onSessionError).toHaveBeenCalled();
    });

    it('should _onSessionTrackAdded be called when webphone session emet trackAdded', () => {
      const sipcallsession = new RTCSipCallSession();
      const vsession = new VirtualSession();
      sipcallsession.setSession(vsession);
      jest.spyOn(sipcallsession, '_onSessionTrackAdded');
      vsession.emitSdhCreated();
      vsession.emitTrackAdded();
      expect(sipcallsession._onSessionTrackAdded).toHaveBeenCalled();
    });
  });
});
