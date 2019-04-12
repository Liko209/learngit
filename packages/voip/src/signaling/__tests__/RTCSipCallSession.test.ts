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
  WEBPHONE_MEDIA_CONNECTION_STATE_EVENT,
} from '../../signaling/types';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../../call/types';
import { RTC_CALL_ACTION } from '../../api/types';
import { rtcLogger } from '../../utils/RTCLoggerProxy';
import { RTCMediaDeviceManager } from '../../api/RTCMediaDeviceManager';

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
    public onMediaConnectionStateChange: any;
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
      },                                  interval);
    }

    stopMediaStats() {
      clearInterval(this._mediaStatsTimer);
    }

    emitMediaConnectionFailed() {
      this.onMediaConnectionStateChange(
        this._session,
        WEBPHONE_MEDIA_CONNECTION_STATE_EVENT.MEDIA_CONNECTION_FAILED,
      );
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

    set onMediaConnectionStateChange(callback: any) {
      this.mediaStreams.onMediaConnectionStateChange = callback;
    }

    terminate = jest.fn();
    flip = jest.fn();
    startRecord = jest.fn();
    stopRecord = jest.fn();
    hold = jest.fn();
    unhold = jest.fn();
    accept = jest.fn();
    reject = jest.fn();
    toVoicemail = jest.fn();
  }

  let sipCallSession: RTCSipCallSession;
  let mockSession: VirtualSession;
  function initSession() {
    sipCallSession = new RTCSipCallSession(mockUuid);
    mockSession = new VirtualSession();
    sipCallSession.setSession(mockSession);
  }
  describe('setsession()', () => {
    it('should _session is null when initialization JPT-573', () => {
      const sipCallSession = new RTCSipCallSession(mockUuid);
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
      const callSession = new RTCSipCallSession(mockUuid);
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
      const callSession = new RTCSipCallSession(mockUuid);
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

  describe('WebPhone SDK APIs', () => {
    it('reconnectMedia() API - succeed', async () => {
      initSession();
      const succeededFunc = jest.fn((session: any) => {
        expect(session).toEqual(mockSession);
      });
      const failedFunc = jest.fn((error: any, session: any) => {
        expect(session).toEqual(mockSession);
      });
      const options = {
        eventHandlers: {
          succeeded: succeededFunc,
          failed: failedFunc,
        },
      };
      sipCallSession.reconnectMedia(options);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         100);
        }),
      ).resolves.toEqual('new');
      expect(succeededFunc).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('reconnectMedia() API - failed', async () => {
      initSession();
      const succeededFunc = jest.fn((session: any) => {
        expect(session).toEqual(mockSession);
      });
      const failedFunc = jest.fn((error: any, session: any) => {
        expect(session).toEqual(mockSession);
      });
      const options = {
        eventHandlers: {
          succeeded: succeededFunc,
          failed: failedFunc,
        },
      };
      mockSession.mediaStreams.testConnectionMode = 'reject';
      sipCallSession.reconnectMedia(options);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         100);
        }),
      ).resolves.toEqual('new');
      expect(failedFunc).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('onMediaConnectionStateChange property should be called when receiving a media connection event', () => {
      global.console = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn(),
      };
      initSession();
      const mediaStreams = mockSession.mediaStreams;
      const tmpError = rtcLogger.error;
      rtcLogger.error = jest.fn((label, msg) => {});
      mediaStreams.emitMediaConnectionFailed();
      expect(rtcLogger.error).toHaveBeenCalled();
      rtcLogger.error = tmpError;
      sipCallSession.destroy();
    });

    it('getMediaStats API - valid callback and valid interval', async () => {
      initSession();
      const callback = jest.fn((report: any, session: any) => {});
      sipCallSession.getMediaStats(callback, 2000);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         2100);
        }),
      ).resolves.toEqual('new');
      expect(callback).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('getMediaStats API - valid callback and invalid interval', async () => {
      initSession();
      const callback = jest.fn((report: any, session: any) => {});
      sipCallSession.getMediaStats(callback, -1);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback).toHaveBeenCalled();
      sipCallSession.destroy();
    });

    it('getMediaStats API - valid callback and  interval = null', async () => {
      initSession();
      const callback = jest.fn((report: any, session: any) => {});
      sipCallSession.getMediaStats(callback);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls.length).toBe(1);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback.mock.calls.length).toBe(2);
      sipCallSession.destroy();
    });

    it('stopMediaStats API ', async () => {
      initSession();
      const callback = jest.fn((report: any, session: any) => {});
      sipCallSession.getMediaStats(callback);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.stopMediaStats();
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.destroy();
    });

    it('_releaseMediaStreams private function ', async () => {
      initSession();
      const callback = jest.fn((report: any, session: any) => {});
      sipCallSession.getMediaStats(callback);
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback.mock.calls.length).toBe(1);
      sipCallSession.destroy();
      await expect(
        new Promise((resolve: any) => {
          setTimeout(() => {
            resolve('new');
          },         1100);
        }),
      ).resolves.toEqual('new');
      expect(callback.mock.calls.length).toBe(1);
    });
  });

  describe('set default audio input/output device', () => {
    function initDefaultAudioDevice(flag: boolean) {
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

    it('should set hasDefaultAudioDevice false if deviceManager has not "default" id when add/remove audio device [JPT-1454]', () => {
      initDefaultAudioDevice(false);
      const hasDefaultInputDevice = RTCMediaDeviceManager.instance().hasDefaultInputAudioDeviceId();
      const hasDefaultOutputDevice = RTCMediaDeviceManager.instance().hasDefaultOutputAudioDeviceId();
      expect(hasDefaultInputDevice).not.toBeTruthy();
      expect(hasDefaultOutputDevice).not.toBeTruthy();
    });

    it('should set hasDefaultAudioDevice true if deviceManager has "default" id when add/remove audio device [JPT-1511]', () => {
      initDefaultAudioDevice(true);
      const hasDefaultInputDevice = RTCMediaDeviceManager.instance().hasDefaultInputAudioDeviceId();
      const hasDefaultOutputDevice = RTCMediaDeviceManager.instance().hasDefaultOutputAudioDeviceId();
      expect(hasDefaultInputDevice).toBeTruthy();
      expect(hasDefaultOutputDevice).toBeTruthy();
    });

    it('should set default audio device to session if deviceManager has "default" id when session enter connected[JPT-1455]', done => {
      initDefaultAudioDevice(true);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      mockSession.emitSessionAccepted();
      setImmediate(() => {
        expect(sipCallSession._setAudioOutputDevice).toHaveBeenCalled();
        expect(sipCallSession._setAudioInputDevice).toHaveBeenCalled();
        done();
      });
    });

    it('should do nothing if hasDefaultAudioDevice equals true when session has not connected [JPT-1456]', () => {
      initDefaultAudioDevice(true);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      expect(sipCallSession._setAudioOutputDevice).not.toHaveBeenCalled();
      expect(sipCallSession._setAudioInputDevice).not.toHaveBeenCalled();
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

    it('should set default audio device to session when outbound call received session accept event and hasDefaultAudioDevice equals true [JPT-1458]', done => {
      initDefaultAudioDevice(true);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      mockSession.emitSessionAccepted();
      setImmediate(() => {
        expect(sipCallSession._setAudioOutputDevice).toHaveBeenCalled();
        expect(sipCallSession._setAudioInputDevice).toHaveBeenCalled();
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

    it('should set default audio device to session when incoming call received session confirmed event and hasDefaultAudioDevice equals true [JPT-1513]', done => {
      initDefaultAudioDevice(true);
      initSession();
      jest.spyOn(sipCallSession, '_setAudioOutputDevice').mockImplementation();
      jest.spyOn(sipCallSession, '_setAudioInputDevice').mockImplementation();
      mockSession.emitSessionConfirmed();
      setImmediate(() => {
        expect(sipCallSession._setAudioOutputDevice).toHaveBeenCalled();
        expect(sipCallSession._setAudioInputDevice).toHaveBeenCalled();
        done();
      });
    });
  });
});
