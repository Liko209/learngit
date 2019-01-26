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
} from '../signaling/types';
import { rtcMediaManager } from '../utils/RTCMediaManager';
import { RTCMediaElement } from '../utils/types';

class RTCSipCallSession extends EventEmitter2 implements IRTCCallSession {
  private _session: any = null;
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
    this._session.on(WEBPHONE_SESSION_STATE.ACCEPTED, () => {
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
    this._session.on(WEBPHONE_SESSION_EVENT.ADD_TRACK, () => {
      this._onSessionTrackAdded();
    });
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

  private _onSessionTrackAdded() {
    if (!this._mediaElement) {
      return;
    }
    const pc = this._session.sessionDescriptionHandler.peerConnection;
    let remote_stream: MediaStream;
    const receivers = pc.getReceivers && pc.getReceivers();
    if (receivers) {
      remote_stream = new MediaStream();
      receivers.forEach((receiver: any) => {
        const track = receiver.track;
        if (track) {
          remote_stream.addTrack(track);
        }
      });
    } else {
      remote_stream = pc.getRemoteStreams() && pc.getRemoteStreams()[0];
    }
    if (remote_stream) {
      this._mediaElement.remote.srcObject = remote_stream;
    }

    let local_stream: MediaStream;
    const senders = pc.getSenders && pc.getSenders();
    if (senders) {
      local_stream = new MediaStream();
      senders.forEach((sender: any) => {
        local_stream.addTrack(sender.track);
      });
    } else {
      local_stream = pc.getLocalStreams() && pc.getLocalStreams()[0];
    }
    if (local_stream) {
      this._mediaElement.local.srcObject = local_stream;
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
      this._session.hold().then(
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS, RTC_CALL_ACTION.HOLD);
        },
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.HOLD);
        },
      );
    }
  }

  unhold() {
    if (this._session) {
      this._session.unhold().then(
        () => {
          this.emit(
            CALL_FSM_NOTIFY.CALL_ACTION_SUCCESS,
            RTC_CALL_ACTION.UNHOLD,
          );
        },
        () => {
          this.emit(CALL_FSM_NOTIFY.CALL_ACTION_FAILED, RTC_CALL_ACTION.UNHOLD);
        },
      );
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
}

export { RTCSipCallSession };
