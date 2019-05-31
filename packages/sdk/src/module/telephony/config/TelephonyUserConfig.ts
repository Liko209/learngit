/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 10:24:11
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../config';
import { AccountGlobalConfig } from '../../../module/account/config';
import { TELEPHONY_KEYS } from './configKeys';

class TelephonyUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'telephony');
  }

  putConfig(key: string, value: any) {
    this.put(key, value);
  }

  getConfig(key: string): any {
    return this.get(key);
  }

  removeConfig(key: string) {
    this.remove(key);
  }

  setLastCalledNumber(num: string) {
    this.put(TELEPHONY_KEYS.LAST_CALLED_NUMBER, num);
  }

  getLastCalledNumber() {
    return this.get(TELEPHONY_KEYS.LAST_CALLED_NUMBER);
  }

  setCurrentMicrophone(value: string) {
    this.put(TELEPHONY_KEYS.CURRENT_MICROPHONE, value);
  }

  getCurrentMicrophone() {
    return this.get(TELEPHONY_KEYS.CURRENT_MICROPHONE);
  }

  setCurrentSpeaker(value: string) {
    this.put(TELEPHONY_KEYS.CURRENT_SPEAKER, value);
  }

  getCurrentSpeaker() {
    return this.get(TELEPHONY_KEYS.CURRENT_SPEAKER);
  }

  setCurrentRinger(value: string) {
    this.put(TELEPHONY_KEYS.CURRENT_RINGER, value);
  }

  getCurrentRinger() {
    return this.get(TELEPHONY_KEYS.CURRENT_RINGER);
  }

  setCurrentVolume(value: string) {
    this.put(TELEPHONY_KEYS.CURRENT_VOLUME, value);
  }

  getCurrentVolume() {
    return this.get(TELEPHONY_KEYS.CURRENT_VOLUME);
  }

  setUsedMicrophoneHistory(value: string) {
    this.put(TELEPHONY_KEYS.USED_MICROPHONE_HISTORY, value);
  }

  getUsedMicrophoneHistory() {
    return this.get(TELEPHONY_KEYS.USED_MICROPHONE_HISTORY);
  }

  setUsedSpeakerHistory(value: string) {
    this.put(TELEPHONY_KEYS.USED_SPEAKER_HISTORY, value);
  }

  getUsedSpeakerHistory() {
    return this.get(TELEPHONY_KEYS.USED_SPEAKER_HISTORY);
  }

  setUsedRingerHistory(value: string) {
    this.put(TELEPHONY_KEYS.USED_RINGER_HISTORY, value);
  }

  getUsedRingerHistory() {
    return this.get(TELEPHONY_KEYS.USED_RINGER_HISTORY);
  }
}

export { TelephonyUserConfig };
