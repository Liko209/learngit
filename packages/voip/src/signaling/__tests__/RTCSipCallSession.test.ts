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
import {
  RTC_CALL_ACTION,
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from '../../api/types';
import { RTCMediaDeviceManager } from '../../api/RTCMediaDeviceManager';
import { CallReport } from '../../report/Call';
import { rtcLogger } from '../../utils/RTCLoggerProxy';

const mockUuid = 'mock_uuid';

describe('sip call session', () => {
  afterEach(() => {
    RTCMediaDeviceManager.instance().removeAllListeners();
  });

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
  class MediaStreams extends EventEmitter2 {
    private _testConnection: string;
    private _session: any;
    private _mediaStatsTimerCallback: any;
    private _mediaStatsTimer: any;
    constructor(session: any) {
      super();
      this._testConnection = 'resolve';
      this._session = session;
    }

    public reconnectMedia(options: any) {
      const self = this;
      return new Promise((resolve, reject) => {
        if (self.testConnectionMode === 'resolve') {
          resolve('succeed');
        } else if (self.testConnectionMode === 'reject') {
          reject(new Error('failed'));
        }
      });
    }

    getMediaStats(callback: any, interval: any) {
      this._mediaStatsTimerCallback = callback;
      this._mediaStatsTimer = setInterval(() => {
        this._mediaStatsTimerCallback();
      }, interval);
    }

    stopMediaStats() {
      clearInterval(this._mediaStatsTimer);
    }

    release() {
      this.stopMediaStats();
    }

    set testConnectionMode(mode: any) {
      this._testConnection = mode;
    }

    get testConnectionMode() {
      return this._testConnection;
    }
  }

  class VirtualSession extends EventEmitter2 {
    public sessionDescriptionHandler: SessionDescriptionHandler;
    public mediaStreams: MediaStreams;
    constructor() {
      super();
      this.sessionDescriptionHandler = new SessionDescriptionHandler();
      this.mediaStreams = new MediaStreams(this);
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
      this.emit(WEBPHONE_SESSION_STATE.FAILED, {statusCode: 487, reasonPhrase: 'Test'});
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

    terminate = jest.fn();
    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();
    hold = jest.fn();
    unhold = jest.fn();
    transfer = jest.fn();
    replyWithMessage = jest.fn();
    accept = jest.fn();
    reject = jest.fn();
    toVoicemail = jest.fn();
  }
  let report: CallReport;
  let sipCallSession: RTCSipCallSession;
  let mockSession: VirtualSession;
  function initSession() {
    report = new CallReport();
    sipCallSession = new RTCSipCallSession(mockUuid, report);
    mockSession = new VirtualSession();
    sipCallSession.setSession(mockSession);
  }
  describe('setsession()', () => {
    it('should _session is null when initialization JPT-573', () => {
      const sipCallSession = new RTCSipCallSession(mockUuid, new CallReport());
      expect(sipCallSession.getSession()).toBe(null);
    });

    it('should session is not null when setSession() be called .JPT-574', () => {
      initSession();
      expect(sipCallSession.getSession()).toBe(mockSession);
    });
  });

  describe('hangup()', () => {
    it('should VirtueSession terminate be called when SipCallSession hangup be called .JPT-575', () => {
      initSession();
      sipCallSession.hangup();
      expect(mockSession.terminate).toHaveBeenCalled();
    });

    it('should no exception when hangup() is called if setSession() not called JPT-577', () => {
      initSession();
      jest.spyOn(sipCallSession, 'hangup');
      sipCallSession.hangup();
      expect(sipCallSession.hangup).toHaveBeenCalled();
    });
  });

  describe('flip()', () => {
    it('should VirtualSession flip be called when SipCallSession flip be called', () => {
      initSession();
      mockSession.flip.mockResolvedValue(null);
      sipCallSession.flip(5);
      expect(mockSession.flip).toHaveBeenCalledWith(5);
    });
  });

  describe('startRecord()', () => {
    it('should VirtualSession startRecord be called when SipCallSession startRecord be called', () => {
      initSession();
      mockSession.startRecord.mockResolvedValue(null);
      sipCallSession.startRecord();
      expect(mockSession.startRecord).toHaveBeenCalled();
    });
  });

  describe('hold()', () => {
    it('should notify reinviteAccepted when receive reinviteAccepted event after call "hold" API [JPT-1136]', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.hold.mockResolvedValue(null);
      sipCallSession.hold();
      mockSession.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_ACCEPTED,
          mockSession,
        );
        done();
      });
    });

    it('should emit hold failed action when hold failed by return promise reject', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.hold.mockRejectedValue(null);
      sipCallSession.hold();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.HOLD,
        );
        done();
      });
    });

    it('should notify reinviteFailed when receive reinviteFailed event after call "hold" API [JPT-1135]', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.hold.mockResolvedValue(null);
      sipCallSession.hold();
      mockSession.emitSessionReinviteFailed();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_FAILED,
          mockSession,
        );
        done();
      });
    });
  });

  describe('unhold()', () => {
    it('should notify reinviteAccepted when receive reinviteAccepted event after call "unhold" API [1138]', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.sessionDescriptionHandler.setDirectionFlag(false);
      mockSession.unhold.mockResolvedValue(null);
      sipCallSession.unhold();
      mockSession.emitSessionReinviteAccepted();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_ACCEPTED,
          mockSession,
        );
        done();
      });
    });

    it('should emit unhold failed action when unhold failed by return promise reject', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.sessionDescriptionHandler.setDirectionFlag(false);
      mockSession.unhold.mockRejectedValue(null);
      sipCallSession.unhold();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.UNHOLD,
        );
        done();
      });
    });

    it('should notify reinviteFailed when receive reinviteFailed event after call "unhold" API [1137]', done => {
      initSession();
      jest.spyOn(sipCallSession, 'emit');
      mockSession.sessionDescriptionHandler.setDirectionFlag(false);
      mockSession.unhold.mockResolvedValue(null);
      sipCallSession.unhold();
      mockSession.emitSessionReinviteFailed();
      setImmediate(() => {
        expect(sipCallSession.emit).toHaveBeenCalledWith(
          CALL_SESSION_STATE.REINVITE_FAILED,
          mockSession,
        );
        done();
      });
    });
  });

  describe('stopRecord()', () => {
    it('should VirtualSession stopRecord be called when SipCallSession stopRecord be called', () => {
      initSession();
      mockSession.stopRecord.mockResolvedValue(null);
      mockSession.startRecord.mockResolvedValue(null);
      sipCallSession.startRecord();
      sipCallSession.stopRecord();
      expect(mockSession.stopRecord).toHaveBeenCalled();
    });
  });

  describe('answer()', () => {
    it('Virtuel Session answer should be called when SipCallSession hangup is called', () => {
      initSession();
      jest.spyOn(mockSession, 'accept');
      sipCallSession.answer();
      expect(mockSession.accept).toHaveBeenCalled();
    });
    it('Should not crash when answer() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      jest.spyOn(callSession, 'answer');
      callSession.answer();
      expect(callSession.answer).toHaveBeenCalled();
    });
  });

  describe('reject()', () => {
    it('Virtuel Session answer should be called when SipCallSession hangup is called', () => {
      initSession();
      sipCallSession.reject();
      expect(mockSession.reject).toHaveBeenCalled();
    });
    it('Should not crash when reject() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession(mockUuid);
      jest.spyOn(callSession, 'reject');
      callSession.reject();
      expect(callSession.reject).toHaveBeenCalled();
    });
  });

  describe('sendToVoicemail()', () => {
    it('Virtuel Session sendToVoicemail() should be called when SipCallSession sendToVoicemail is called', () => {
      initSession();
      sipCallSession.sendToVoicemail();
      expect(mockSession.toVoicemail).toHaveBeenCalled();
    });
    it('Should not crash when reject() is called and setSession() is not called', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      jest.spyOn(callSession, 'sendToVoicemail');
      callSession.sendToVoicemail();
      expect(callSession.sendToVoicemail).toHaveBeenCalled();
    });
  });

  describe('_onSession*******()', () => {
    it('should _onSessionConfirmed be called when VirtualSession emit Confirmed JPT-576', () => {
      initSession();
      jest.spyOn(sipCallSession, '_onSessionConfirmed');
      mockSession.emitSessionConfirmed();
      expect(sipCallSession._onSessionConfirmed).toHaveBeenCalled();
    });

    it('should _onSessionAccepted be called when VirtualSession emit Accepted', () => {
      initSession();
      jest.spyOn(sipCallSession, '_onSessionAccepted');
      mockSession.emitSessionAccepted();
      expect(sipCallSession._onSessionAccepted).toHaveBeenCalled();
    });

    it('should _onSessionDisconnected be called when VirtualSession emit Disconnected JPT-578', () => {
      initSession();
      jest.spyOn(sipCallSession, '_onSessionDisconnected');
      mockSession.emitSessionDisconnected();
      expect(sipCallSession._onSessionDisconnected).toHaveBeenCalled();
    });

    it('should _onSessionError be called when VirtualSession emit Error JPT-579', () => {
      initSession();
      jest.spyOn(sipCallSession, '_onSessionError');
      mockSession.emitSessionError();
      expect(sipCallSession._onSessionError).toHaveBeenCalled();
    });

    it('should _onSessionTrackAdded be called when webphone session emet trackAdded', () => {
      initSession();
      jest.spyOn(sipCallSession, '_onSessionTrackAdded');
      mockSession.emitSdhCreated();
      mockSession.emitTrackAdded();
      expect(sipCallSession._onSessionTrackAdded).toHaveBeenCalled();
    });
  });

  describe('Transfer call', () => {
    it('should call webphone transfer api when transfer is called', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      vsession.transfer.mockResolvedValue(null);
      callSession.transfer();
      expect(vsession.transfer).toHaveBeenCalled();
    });
  });

  describe('Reply with pattern', () => {
    it('should call webphone replyWithMessage api when replyWithPattern is called with in a meeting', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(RTC_REPLY_MSG_PATTERN.IN_A_MEETING, 0, RTC_REPLY_MSG_TIME_UNIT.MINUTE);
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 5,
        callbackDirection: 0,
        timeUnits: 0,
        timeValue: 0,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on my way', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(RTC_REPLY_MSG_PATTERN.ON_MY_WAY, 5, RTC_REPLY_MSG_TIME_UNIT.MINUTE);
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 2,
        callbackDirection: 0,
        timeUnits: 0,
        timeValue: 5,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on the other line', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(RTC_REPLY_MSG_PATTERN.ON_THE_OTHER_LINE, 5, RTC_REPLY_MSG_TIME_UNIT.MINUTE);
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 6,
        callbackDirection: 0,
        timeUnits: 0,
        timeValue: 5,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on call you back later', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(
        RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER,
        0,
        RTC_REPLY_MSG_TIME_UNIT.MINUTE
      );
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 4,
        callbackDirection: 0,
        timeUnits: 0,
        timeValue: 0,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on call you back later in 5 min', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(
        RTC_REPLY_MSG_PATTERN.WILL_CALL_YOU_BACK_LATER,
        5,
        RTC_REPLY_MSG_TIME_UNIT.MINUTE,
      );
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 1,
        callbackDirection: 0,
        timeUnits: 0,
        timeValue: 5,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on call me back', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER, 0, RTC_REPLY_MSG_TIME_UNIT.MINUTE);
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 4,
        callbackDirection: 1,
        timeUnits: 0,
        timeValue: 0,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on call me back in 5 hour', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        5,
        RTC_REPLY_MSG_TIME_UNIT.HOUR,
      );
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 1,
        callbackDirection: 1,
        timeUnits: 1,
        timeValue: 5,
      });
    });
    it('should call webphone replyWithMessage api when replyWithPattern is called with on call me back in 5 day', () => {
      const callSession = new RTCSipCallSession(mockUuid, new CallReport());
      const vsession = new VirtualSession();
      callSession.setSession(vsession);
      callSession.replyWithPattern(
        RTC_REPLY_MSG_PATTERN.CALL_ME_BACK_LATER,
        5,
        RTC_REPLY_MSG_TIME_UNIT.DAY,
      );
      expect(vsession.replyWithMessage).toHaveBeenCalledWith({
        replyType: 1,
        callbackDirection: 1,
        timeUnits: 2,
        timeValue: 5,
      });
    });
  });

  describe('WebPhone SDK APIs', () => {
    it('reconnectMedia() API - succeed', done => {
      initSession();
      const succeededFunc = jest.fn();
      const failedFunc = jest.fn();
      const options = {
        eventHandlers: {
          succeeded: succeededFunc,
          failed: failedFunc,
        },
      };
      sipCallSession.reconnectMedia(options);
      setImmediate(() => {
        expect(succeededFunc).toHaveBeenCalled();
        sipCallSession.destroy();
        done();
      });
    });

    it('reconnectMedia() API - failed', done => {
      initSession();
      const succeededFunc = jest.fn();
      const failedFunc = jest.fn();
      const options = {
        eventHandlers: {
          succeeded: succeededFunc,
          failed: failedFunc,
        },
      };
      mockSession.mediaStreams.testConnectionMode = 'reject';
      sipCallSession.reconnectMedia(options);
      setImmediate(() => {
        expect(failedFunc).toHaveBeenCalled();
        sipCallSession.destroy();
        done();
      });
    });

    it('getMediaStats API - valid callback and valid interval', async () => {
      jest.useFakeTimers();
      initSession();
      const callback = jest.fn();
      sipCallSession.getMediaStats(callback, 2000);
      jest.advanceTimersByTime(2000);
      expect(callback).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('getMediaStats API - valid callback and invalid interval', async () => {
      jest.useFakeTimers();
      initSession();
      const callback = jest.fn();
      sipCallSession.getMediaStats(callback, -1);
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('getMediaStats API - valid callback and  interval = null', async () => {
      jest.useFakeTimers();
      initSession();
      const callback = jest.fn();
      sipCallSession.getMediaStats(callback, 1000);
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(2);
      sipCallSession.destroy();
    });

    it('stopMediaStats API ', async () => {
      jest.useFakeTimers();
      initSession();
      const callback = jest.fn();
      sipCallSession.getMediaStats(callback, 1000);
      jest.advanceTimersByTime(1000);
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.stopMediaStats();
      jest.advanceTimersByTime(1000);
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.destroy();
    });

    it('_releaseMediaStreams private function ', async () => {
      jest.useFakeTimers();
      initSession();
      const callback = jest.fn();
      sipCallSession.getMediaStats(callback, 1000);
      jest.advanceTimersByTime(1000);
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.destroy();
      jest.advanceTimersByTime(1000);
      expect(callback.mock.calls.length).toBe(1);
    });
  });

  describe('set default audio input/output device', () => {
    function initDefaultAudioDevice(flag: boolean) {
      RTCMediaDeviceManager.instance().destroy();
      let deviceInfos: MediaDeviceInfo[];
      if (flag) {
        deviceInfos = [
          {
            deviceId: 'default',
            kind: 'audiooutput',
            label: 'Default',
            groupId: '1',
          },
          {
            deviceId: 'testId',
            kind: 'audiooutput',
            label: 'test',
            groupId: '2',
          },
          {
            deviceId: 'default',
            kind: 'audioinput',
            label: 'Default',
            groupId: '1',
          },
          {
            deviceId: 'testId',
            kind: 'audioinput',
            label: 'test',
            groupId: '2',
          },
        ];
      } else {
        deviceInfos = [
          {
            deviceId: 'testId1',
            kind: 'audiooutput',
            label: 'Default',
            groupId: '1',
          },
          {
            deviceId: 'testId2',
            kind: 'audiooutput',
            label: 'test',
            groupId: '2',
          },
          {
            deviceId: 'testId1',
            kind: 'audioinput',
            label: 'Default',
            groupId: '1',
          },
          {
            deviceId: 'testId2',
            kind: 'audioinput',
            label: 'test',
            groupId: '2',
          },
        ];
      }
      RTCMediaDeviceManager.instance()._gotMediaDevices(deviceInfos);
    }

    it('should answer call with input audio deviceId if get current input audio deviceId when accept incoming call [JPT-2845]', done => {
      const mockInputAudioId = '1111';
      const sessionDescriptionHandlerOptions = {
        constraints: {
          audio: {
            deviceId: {
              exact: mockInputAudioId,
            },
          },
          video: false,
        },
      };
      jest
        .spyOn(RTCMediaDeviceManager.instance(), 'getCurrentAudioInput')
        .mockReturnValue(mockInputAudioId);
      initSession();
      sipCallSession.answer();
      setImmediate(() => {
        expect(mockSession.accept).toHaveBeenCalledWith({
          sessionDescriptionHandlerOptions,
        });
        RTCMediaDeviceManager.instance().destroy();
        done();
      });
    });

    it('should answer call without input audio deviceId if get current input audio deviceId failed when accept incoming call [JPT-2844]', done => {
      jest
        .spyOn(RTCMediaDeviceManager.instance(), 'getCurrentAudioInput')
        .mockReturnValue('');
      initSession();
      sipCallSession.answer();
      setImmediate(() => {
        expect(mockSession.accept).toHaveBeenCalledWith();
        RTCMediaDeviceManager.instance().destroy();
        done();
      });
    });

    it('should set output audio deviceId into media stream if get current output audio deviceId succeed when new SipCallSession [JPT-2843]', done => {
      (RTCSipCallSession.prototype as any)._setAudioOutputDevice = jest.fn();
      const mockOutputAudioId = '1111';
      jest
        .spyOn(RTCMediaDeviceManager.instance(), 'getCurrentAudioOutput')
        .mockReturnValue(mockOutputAudioId);
      jest.spyOn(rtcLogger, 'debug');
      sipCallSession = new RTCSipCallSession(mockUuid);
      setImmediate(() => {
        expect(
          (sipCallSession as any)._setAudioOutputDevice,
        ).toHaveBeenCalledWith(mockOutputAudioId);
        RTCMediaDeviceManager.instance().destroy();
        jest.clearAllMocks();
        done();
      });
    });

    it('should do noting if get current output audio deviceId failed when new SipCallSession [JPT-2842]', done => {
      (RTCSipCallSession.prototype as any)._setAudioOutputDevice = jest.fn();
      jest
        .spyOn(RTCMediaDeviceManager.instance(), 'getCurrentAudioOutput')
        .mockReturnValue('');
      jest.spyOn(rtcLogger, 'debug');
      sipCallSession = new RTCSipCallSession(mockUuid);
      setImmediate(() => {
        expect(
          (sipCallSession as any)._setAudioOutputDevice,
        ).not.toHaveBeenCalled();
        RTCMediaDeviceManager.instance().destroy();
        jest.clearAllMocks();
        done();
      });
    });

    it('should do nothing if hasDefaultAudioDevice equals false when outbound call received session accept event [JPT-1457]', done => {
      initDefaultAudioDevice(false);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      mockSession.emitSessionAccepted();
      setImmediate(() => {
        expect(sipCallSession._setAudioOutputDevice).not.toHaveBeenCalled();
        expect(sipCallSession._setAudioInputDevice).not.toHaveBeenCalled();
        done();
      });
    });

    it('should do nothing if hasDefaultAudioDevice equals false when incoming call received session confirmed event [JPT-1512]', () => {
      initDefaultAudioDevice(false);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      mockSession.emitSessionConfirmed();
      expect(sipCallSession._setAudioOutputDevice).not.toHaveBeenCalled();
      expect(sipCallSession._setAudioInputDevice).not.toHaveBeenCalled();
    });

    it('should call _setAudioInput API of call session when upper layer call setAudioInput API.[JPT-2262]', () => {
      jest.useFakeTimers();
      RTCMediaDeviceManager.instance().destroy();
      initSession();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      RTCMediaDeviceManager.instance().setAudioInputDevice('123');
      jest.advanceTimersByTime(500);
      expect(sipCallSession._setAudioInputDevice).toHaveBeenCalled();
    });

    it('should call _setAudioOutput API of call session when upper layer call setAudioInput API.[JPT-2263]', () => {
      jest.useFakeTimers();
      RTCMediaDeviceManager.instance().destroy();
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      RTCMediaDeviceManager.instance().setAudioOutputDevice('123');
      jest.advanceTimersByTime(500);
      expect(sipCallSession._setAudioOutputDevice).toHaveBeenCalled();
    });
  });
});
