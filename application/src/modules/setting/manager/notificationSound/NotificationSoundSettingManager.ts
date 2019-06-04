/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 11:31:21
 * Copyright © RingCentral. All rights reserved.
 */
import {
  ISettingService,
  SETTING_ITEM_TYPE,
  SelectSettingItem,
  SliderSettingItem,
} from '@/interface/setting';
import { MediaDeviceSourceItem } from './audioSource/MediaDeviceSourceItem';
import { SpeakerMuteIcon, SpeakerIcon } from './audioSource/SpeakerIcon';
import {
  SETTING_PAGE__NOTIFICATION_SOUND,
  SETTING_SECTION__SOUNDS,
  SETTING_SECTION__AUDIO_SOURCE,
  SETTING_ITEM__MICROPHONE_SOURCE,
  SETTING_ITEM__SPEAKER_SOURCE,
  SETTING_ITEM__VOLUME,
} from './constant';

const deviceIdExtractor = (device?: MediaDeviceInfo) =>
  device && device.deviceId;

class NotificationSoundSettingManager {
  private _scope = Symbol('NotificationSoundSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__NOTIFICATION_SOUND,
      automationId: 'notificationAndSounds',
      icon: 'bell',
      title: 'setting.notificationAndSounds',
      path: '/notification_and_sounds',
      weight: 100,
      sections: [
        {
          id: SETTING_SECTION__SOUNDS,
          automationId: 'sounds',
          title: 'setting.sounds',
          weight: 200,
          items: [],
        },
        {
          id: SETTING_SECTION__AUDIO_SOURCE,
          automationId: 'audioSource',
          title: 'setting.audioSource.title',
          weight: 300,
          items: [
            {
              id: SETTING_ITEM__MICROPHONE_SOURCE,
              automationId: 'microphoneSource',
              title: 'setting.audioSource.microphoneSource.label',
              description: 'setting.audioSource.microphoneSource.description',
              valueExtractor: deviceIdExtractor,
              sourceRenderer: MediaDeviceSourceItem,
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 0,
            } as SelectSettingItem<MediaDeviceInfo>,
            {
              id: SETTING_ITEM__SPEAKER_SOURCE,
              automationId: 'speakerSource',
              title: 'setting.audioSource.speakerSource.label',
              description: 'setting.audioSource.speakerSource.description',
              valueExtractor: deviceIdExtractor,
              sourceRenderer: MediaDeviceSourceItem,
              type: SETTING_ITEM_TYPE.SELECT,
              weight: 100,
            } as SelectSettingItem<MediaDeviceInfo>,
            {
              id: SETTING_ITEM__VOLUME,
              automationId: 'volume',
              title: 'setting.audioSource.volume.label',
              description: 'setting.audioSource.volume.description',
              type: SETTING_ITEM_TYPE.SLIDER,
              Left: SpeakerMuteIcon,
              Right: SpeakerIcon,
              min: 0,
              max: 1,
              weight: 200,
            } as SliderSettingItem,
          ],
        },
      ],
    });
  }

  dispose() {
    this._settingService.unRegisterAll(this._scope);
  }
}

export { NotificationSoundSettingManager };
