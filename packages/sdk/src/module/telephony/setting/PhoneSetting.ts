/*
 * @Author: Paynter Chen
 * @Date: 2019-05-29 23:28:04
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { BaseModuleSetting, SettingEntityIds } from 'sdk/module/setting';
import RTCEngine from 'voip';

import {
  MicrophoneSourceSettingHandler,
  SpeakerSourceSettingHandler,
  VolumeSettingHandler,
} from './handlers';
import { ITelephonyService } from '../service/ITelephonyService';

type HandlerMap = {
  [SettingEntityIds.Phone_MicrophoneSource]: MicrophoneSourceSettingHandler;
  [SettingEntityIds.Phone_SpeakerSource]: SpeakerSourceSettingHandler;
  [SettingEntityIds.Phone_Volume]: VolumeSettingHandler;
};

export class PhoneSetting extends BaseModuleSetting<HandlerMap> {
  constructor(
    private _telephonyService: ITelephonyService,
    private _rtcEngine: RTCEngine = RTCEngine.getInstance(),
  ) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_MicrophoneSource]: new MicrophoneSourceSettingHandler(
        this._telephonyService,
        this._rtcEngine,
      ),
      [SettingEntityIds.Phone_SpeakerSource]: new SpeakerSourceSettingHandler(
        this._telephonyService,
        this._rtcEngine,
      ),
      [SettingEntityIds.Phone_Volume]: new VolumeSettingHandler(
        this._telephonyService,
      ),
    };
  }
}
