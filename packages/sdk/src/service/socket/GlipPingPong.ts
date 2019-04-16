/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-01 14:12:15
 * Copyright © RingCentral. All rights reserved.
 */

const PING_TIMEOUT = 20000; // 20s
const GLIP_PING = 'glip_ping';
const GLIP_PONG = 'glip_pong';
const CHECK_CONNECTED_INTERVAL = 1000; // 1s
const CHECK_CONNECTED_MAX_TIMEOUT = 5000; // 5s

import { mainLogger } from 'foundation';
import { getCurrentTime } from '../../utils/jsUtils';
import { HeartBeatCheck } from './HeartBeatCheck';
import notificationCenter from '../notificationCenter';
import { SERVICE } from '../eventKey';

type GlipPingPongType = {
  socket: SocketIOClient.Socket;
  pingTimeOut?: number;
  callback: GlipPingCallback;
};

type GlipPingCallback = (success: boolean) => void;

class GlipPingPong {
  private _pingTimeOutTime: number = PING_TIMEOUT;
  private _socket?: SocketIOClient.Socket;
  private _pingCallbacks: GlipPingCallback[] = [];
  private _pingPongStatusCallback?: GlipPingCallback;
  private _pingTimeOutId?: NodeJS.Timeout;
  private _logPrefix: string = '[SOCKET GLIP_PING_PONG]';
  private _heartBeatCheck?: HeartBeatCheck;
  constructor(options: GlipPingPongType) {
    this._pingTimeOutTime = options.pingTimeOut || PING_TIMEOUT;
    this._socket = options.socket;
    this._pingPongStatusCallback = options.callback;
    this._init();
  }

  ping(callback: GlipPingCallback) {
    mainLogger.log(this._logPrefix, ' enter glip ping');
    if (this._socket) {
      callback && this._pingCallbacks.push(callback);
      if (!this._pingTimeOutId) {
        const pingId = getCurrentTime();
        this._pingTimeOutId = setTimeout(
          this._onPingFailure.bind(this),
          this._pingTimeOutTime,
        );
        mainLogger.log(this._logPrefix, ' ping id: ', pingId);
        this._socket.emit(GLIP_PING, pingId);
      }
    } else {
      callback && callback(false);
    }
  }

  cleanup() {
    this._heartBeatCheck && this._heartBeatCheck.cleanUp();
    this._heartBeatCheck = undefined;
    this._socket && this._socket.removeEventListener(GLIP_PONG);
    this._socket = undefined;
    this._pingPongStatusCallback = undefined;
    this._pingCallbacks = [];
    this._clearPingTimeOutId();
    mainLogger.log(this._logPrefix, ' cleanup done');
  }

  private _onPingFailure() {
    this._handlePingResult(false);
  }

  private _onPong(id: number) {
    mainLogger.log(this._logPrefix, ' ping back to pong id: ', id);
    this._handlePingResult(true);
  }

  private _init() {
    this._socket && this._socket.on(GLIP_PONG, this._onPong.bind(this));
    if (!this._heartBeatCheck) {
      this._heartBeatCheck = new HeartBeatCheck(
        CHECK_CONNECTED_INTERVAL,
        CHECK_CONNECTED_MAX_TIMEOUT,
        this._wakeUpFromSleepMode.bind(this),
      );
    }
  }

  private _wakeUpFromSleepMode(slice: number) {
    notificationCenter.emitKVChange(SERVICE.WAKE_UP_FROM_SLEEP);
    this._checkConnected(slice);
  }

  private _checkConnected(slice: number) {
    mainLogger.log(this._logPrefix, ' check connection slice:', slice);
    this.ping((success: boolean) => {
      if (success) {
        mainLogger.log(this._logPrefix, ' ping success with slice', slice);
      } else {
        mainLogger.log(this._logPrefix, ' ping failed with slice', slice);
      }
    });
  }

  private _handlePingResult(success: boolean) {
    mainLogger.log(
      this._logPrefix,
      ' socket-> glip ping pong handle ping result:',
      success,
    );
    this._clearPingTimeOutId();

    this._pingPongStatusCallback && this._pingPongStatusCallback(success);

    this._pingCallbacks.forEach((callback: GlipPingCallback) => {
      callback(success);
    });

    this._pingCallbacks = [];
  }

  private _clearPingTimeOutId() {
    if (this._pingTimeOutId) {
      clearTimeout(this._pingTimeOutId);
      this._pingTimeOutId = undefined;
    }
  }
}

export { GlipPingPong };
