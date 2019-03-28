/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 15:51:30
 * Copyright © RingCentral. All rights reserved.
 */

import { EventEmitter2 } from 'eventemitter2';
import { IRTCCallSession } from '../signaling/IRTCCallSession';
import { CALL_SESSION_STATE, CALL_FSM_NOTIFY } from '../call/types';
import { RTC_CALL_ACTION, RTCCallActionSuccessOptions } from '../api/types';
import {
  WEBPHONE_SESSION_STATE,
  WEBPHONE_SESSION_EVENT,
  WEBPHONE_MEDIA_CONNECTION_STATE_EVENT,
} from '../signaling/types';
import { rtcMediaManager } from '../utils/RTCMediaManager';
import { RTCMediaElement } from '../utils/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';
const {
  MediaStreams,
} = require('ringcentral-web-phone/src/ringcentral-web-phone-media-engine');

const LOG_TAG = 'RTCSipCallSession';
class RTCSipCallSession extends EventEmitter2 implements IRTCCallSession {
  private _session: any = null;
  private _inviteResponse: any = null;
  private _uuid: string = '';
  private _mediaElement: RTCMediaElement | null;

  constructor(uuid: string) {
    super();
    this._uuid = uuid;
    this._mediaElement = rtcMediaManager.createMediaElement(this._uuid);
  }
  destroy() {
    if (!this._session) {
      return;
    }
    this._session.removeAllListeners();
    this._releaseMediaStreams();
    if (this._session.sessionDescriptionHandler) {
      this._session.sessionDescriptionHandler.removeAllListeners();
    }

    const sdh = this._session.sessionDescriptionHandler;
    const pc = sdh && sdh.peerConnection;
    if (pc) {
      sdh.close();
    }
    rtcMediaManager.removeMediaElement(this._uuid);
    this._session = null;
  }

  private _prepareSipSession() {
    if (!this._session) {
      return;
    }
    this._session.on(WEBPHONE_SESSION_STATE.ACCEPTED, (inviteRes: any) => {
      this._inviteResponse = inviteRes;
      this._onSessionAccepted();
    });
    this._session.on(WEBPHONE_SESSION_STATE.CONFIRMED, () => {
      this._onSessionConfirmed();
    });
    this._session.on(WEBPHONE_SESSION_STATE.BYE, () => {
      this._onSessionDisconnected();
    });
    this._session.on(WEBPHONE_SESSION_STATE.FAILED, () => {
      this._onSessionError();
    });
    this._session.on(WEBPHONE_SESSION_STATE.PROGRESS, (response: any) => {
      this._onSessionProgress(response);
    });
    this._session.on(WEBPHONE_SESSION_EVENT.SDH_CREATED, () => {
      this._session.sessionDescriptionHandler.on(
        WEBPHONE_SESSION_EVENT.ADD_TRACK,
        (e: RTCTrackEvent) => {
          this._onSessionTrackAdded(e);
        },
      );
    });
    this._session.on(
      WEBPHONE_SESSION_STATE.REINVITE_ACCEPTED,
      (session: any) => {
        this._onSessionReinviteAccepted(session);
      },
    );
    this._session.on(WEBPHONE_SESSION_STATE.REINVITE_FAILED, (session: any) => {
      this._onSessionReinviteFailed(session);
    });
    this._session.onMediaConnectionStateChange = this._onMediaConnectionStateChange;
  }

  private _onSessionAccepted() {
    this.emit(CALL_SESSION_STATE.ACCEPTED);
  }

  private _onSessionConfirmed() {
    this.emit(CALL_SESSION_STATE.CONFIRMED);
  }

  private _onSessionDisconnected() {
    this.emit(CALL_SESSION_STATE.DISCONNECTED);
  }

  private _onSessionError() {
    this.emit(CALL_SESSION_STATE.ERROR);
  }

  private _onSessionProgress(response: any) {
    this.emit(CALL_SESSION_STATE.PROGRESS, response);
  }

  getInviteResponse() {
    return this._inviteResponse;
  }

  private _onSessionTrackAdded(e: RTCTrackEvent) {
    if (!this._mediaElement) {
      return;
    }
    if (
      !this._session ||
      !this._session.sessionDescriptionHandler ||
      !this._session.sessionDescriptionHandler.peerConnection
    ) {
      return;
    }
    const pc = this._session.sessionDescriptionHandler.peerConnection;
    let remote_stream: MediaStream;
    const receivers = pc.getReceivers && pc.getReceivers();
    if (receivers) {
      remote_stream = new MediaStream();
      if (e.type === 'track' && e.track) {
        rtcLogger.debug(LOG_TAG, 'Receiver track from RTCTrackEvent added');
        remote_stream.addTrack(e.track);
      } else {
        receivers.forEach((receiver: any) => {
          const rtrack = receiver.track;
          if (rtrack) {
            rtcLogger.debug(LOG_TAG, 'Receiver track from Receivers added');
            remote_stream.addTrack(rtrack);
          }
        });
      }
    } else {
      remote_stream = pc.getRemoteStreams() && pc.getRemoteStreams()[0];
    }
    if (remote_stream) {
      this._mediaElement.remote.srcObject = remote_stream;
      this._mediaElement.remote.play().catch(() => {
        rtcLogger.error(LOG_TAG, 'Failed to play remote media element');
      });
    }

    let local_stream: MediaStream;
    const senders = pc.getSenders && pc.getSenders();
    if (senders) {
      local_stream = new MediaStream();
      senders.forEach((sender: any) => {
        const strack = sender.track;
        if (strack && strack.kind === 'audio') {
          rtcLogger.debug(LOG_TAG, 'Sender track added');
          local_stream.addTrack(strack);
        }
      });
    } else {
      local_stream = pc.getLocalStreams() && pc.getLocalStreams()[0];
    }
    if (local_stream) {
      this._mediaElement.local.srcObject = local_stream;
      this._mediaElement.local.play().catch(() => {
        rtcLogger.error(LOG_TAG, 'Failed to play local media element');
      });
    }

    if (local_stream && remote_stream) {
      this._session.mediaStreams = new MediaStreams(this._session);
    }
  }

  private _onSessionReinviteAccepted(session: any) {
    this.emit(CALL_SESSION_STATE.REINVITE_ACCEPTED, session);
  }

  private _onSessionReinviteFailed(session: any) {
    this.emit(CALL_SESSION_STATE.REINVITE_FAILED, session);
  }

  private _onMediaConnectionStateChange(session: any, event: any) {
    rtcLogger.debug(LOG_TAG, `WebRTC media connection state = ${event}`);
    switch (event) {
      case WEBPHONE_MEDIA_CONNECTION_STATE_EVENT.MEDIA_CONNECTION_FAILED:
        rtcLogger.error(LOG_TAG, `Reconnecting media. State = ${event}`);
        break;
    }
  }

  private _releaseMediaStreams() {
    if (this._session && this._session.mediaStreams) {
      this._session.mediaStreams.release();
    }
  }

  hangup() {
    if (this._session != null) {
      this._session.terminate();
    }
  }

  flip(target: number) {
    this._session.flip(target).then(
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.FLIP);
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.FLIP);
      },
    );
  }

  transfer(target: string) {
    this._session.transfer(target).then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.TRANSFER,
        );
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.TRANSFER);
      },
    );
  }

  park() {
    this._session.park().then(
      (parkOptions: any) => {
        const options: RTCCallActionSuccessOptions = {
          parkExtension: parkOptions['park extension'],
        };
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.PARK,
          options,
        );
      },
      () => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.PARK);
      },
    );
  }

  startRecord() {
    this._session.startRecord().then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.START_RECORD,
        );
      },
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.START_RECORD,
        );
      },
    );
  }

  stopRecord() {
    this._session.stopRecord().then(
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
          RTC_CALL_ACTION.STOP_RECORD,
        );
      },
      () => {
        this.emit(
          CALL_FSM_NOTIFY.CALL_ACTION_FAILED,
          RTC_CALL_ACTION.STOP_RECORD,
        );
      },
    );
  }

  mute() {
    if (this._session) {
      this._session.mute();
    }
  }

  unmute() {
    if (this._session) {
      this._session.unmute();
    }
  }

  answer() {
    if (this._session) {
      this._session.accept();
    }
  }

  reject() {
    if (this._session) {
      this._session.reject();
    }
  }

  sendToVoicemail() {
    if (this._session) {
      this._session.toVoicemail();
    }
  }

  hold() {
    if (this._session) {
      this._session.hold().catch(() => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.HOLD);
      });
    }
  }

  unhold() {
    if (this._session) {
      this._session.unhold().catch(() => {
        this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.UNHOLD);
      });
    }
  }

  dtmf(digits: string) {
    if (this._session) {
      this._session.dtmf(digits);
    }
  }

  setSession(session: any) {
    if (session) {
      this._session = session;
      this._prepareSipSession();
    }
  }

  getSession() {
    return this._session;
  }

  reconnectMedia(options: any) {
    if (this._session && this._session.mediaStreams) {
      this._session.mediaStreams
        .reconnectMedia(options)
        .then(() => {
          if (options && options.eventHandlers) {
            options.eventHandlers.succeeded(this._session);
          }
        })
        .catch((error: any) => {
          if (options && options.eventHandlers) {
            options.eventHandlers.failed(error, this._session);
          }
        });
    }
  }

  getMediaStats(callback: any, interval: number) {
    if (this._session && this._session.mediaStreams) {
      let timerInterval = interval;
      if (!interval || interval < 0) {
        timerInterval = 1000;
      }
      this._session.mediaStreams.getMediaStats(callback, timerInterval);
    }
  }

  stopMediaStats() {
    if (this._session && this._session.mediaStreams) {
      this._session.mediaStreams.stopMediaStats();
    }
  }
}

export { RTCSipCallSession };
