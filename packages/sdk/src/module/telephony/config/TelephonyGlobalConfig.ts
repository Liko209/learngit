/*
 * @Author: Paynter Chen
 * @Date: 2019-06-03 18:09:34
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../config';
import { TELEPHONY_GLOBAL_KEYS } from './configKeys';

class TelephonyGlobalConfig extends GlobalConfig {
  static moduleName = 'telephony';

  static setCurrentMicrophone(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE, value);
  }

  static getCurrentMicrophone() {
    return this.get(TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE);
  }

  static setCurrentSpeaker(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER, value);
  }

  static getCurrentSpeaker() {
    return this.get(TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER);
  }

  static setCurrentRinger(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER, value);
  }

  static getCurrentRinger() {
    return this.get(TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER);
  }

  static setCurrentVolume(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME, value);
  }

  static getCurrentVolume() {
    return this.get(TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME);
  }

  static setUsedMicrophoneHistory(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.USED_MICROPHONE_HISTORY, value);
  }

  static getUsedMicrophoneHistory() {
    return this.get(TELEPHONY_GLOBAL_KEYS.USED_MICROPHONE_HISTORY);
  }

  static setUsedSpeakerHistory(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.USED_SPEAKER_HISTORY, value);
  }

  static getUsedSpeakerHistory() {
    return this.get(TELEPHONY_GLOBAL_KEYS.USED_SPEAKER_HISTORY);
  }

  static setUsedRingerHistory(value: string) {
    this.put(TELEPHONY_GLOBAL_KEYS.USED_RINGER_HISTORY, value);
  }

  static getUsedRingerHistory() {
    return this.get(TELEPHONY_GLOBAL_KEYS.USED_RINGER_HISTORY);
  }
}

export { TelephonyGlobalConfig };
