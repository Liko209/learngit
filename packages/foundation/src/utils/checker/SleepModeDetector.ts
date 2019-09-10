/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-06 09:39:38
 * Copyright © RingCentral. All rights reserved.
 */

import { HeartBeatCheck } from './HeartBeatCheck';
import { mainLogger } from '../../log';

const CHECK_CONNECTED_INTERVAL = 1000; // 1s
const CHECK_CONNECTED_MAX_TIMEOUT = 5000; // 5s

type SleepModeDetectorCallback = (interval: number) => void;

const TAG = 'SleepModeDetector';

class SleepModeDetector {
  private _heartBeatCheck: HeartBeatCheck;
  private _callbacksMap = new Map<string, SleepModeDetectorCallback>();
  constructor() {}

  public subScribe(key: string, callback: SleepModeDetectorCallback) {
    if (!this._heartBeatCheck) {
      this._heartBeatCheck = new HeartBeatCheck(
        CHECK_CONNECTED_INTERVAL,
        CHECK_CONNECTED_MAX_TIMEOUT,
        this._wakeUpFromSleepMode.bind(this),
      );
    }

    mainLogger.info(TAG, ' subScribe:', key);
    if (this._callbacksMap.has(key)) {
      mainLogger.info(`SleepModeDetector subscribe, key:${key} has existed`);
      return false;
    }
    this._callbacksMap.set(key, callback);
    return true;
  }

  public unSubscribe(key: string) {
    mainLogger.info(TAG, ' unSubscribe:', key);
    if (this._callbacksMap.has(key)) {
      this._callbacksMap.delete(key);
    }
  }

  public cleanUp() {
    this._heartBeatCheck && this._heartBeatCheck.cleanUp();
    delete this._heartBeatCheck;
    this._callbacksMap.clear();
  }

  private _wakeUpFromSleepMode(interval: number) {
    mainLogger.info(TAG, ' _wakeUpFromSleepMode:', interval);
    this._callbacksMap.forEach(value => {
      value(interval);
    });
  }
}

const sleepModeDetector = new SleepModeDetector();
export { sleepModeDetector, SleepModeDetector };
