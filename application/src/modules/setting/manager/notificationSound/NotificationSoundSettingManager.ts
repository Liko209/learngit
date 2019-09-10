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
  SETTING_ITEM__RINGER_SOURCE,
  SETTING_ITEM__VOLUME,
} from './constant';
import {
  DEFAULT_AUDIO_INPUT_DEVICES,
  DEFAULT_AUDIO_OUTPUT_DEVICES,
} from './audioSource/constant';
import { Notification } from '@/containers/Notification';
import { dataAnalysis } from 'foundation/analysis';
import { mainLogger } from 'foundation/log';

const logTag = '[Settings][Audio]';
const deviceIdExtractor = (device?: MediaDeviceInfo) =>
  device ? device.deviceId : '';

class NotificationSoundSettingManager {
  private _scope = Symbol('NotificationSoundSettingManager');
  @ISettingService private _settingService: ISettingService;

  init() {
    const onPermissionDenied = async () => {
      Notification.flagWarningToast(
        'setting.audioSource.microphonePermissionBlocked',
      );

      dataAnalysis.track('Jup_Web/DT_settings_microphone_blocked', {
        endPoint: 'web',
      });
    };
    const baseDeviceSettingItem = {
      valueExtractor: deviceIdExtractor,
      sourceRenderer: MediaDeviceSourceItem,
      type: SETTING_ITEM_TYPE.SELECT,
      onBeforeOpen: async () => {
        const permissions = window.navigator['permissions'];
        if (!permissions) {
          mainLogger.info(`${logTag}Not permissions module`);
          return true;
        }

        const permissionInfo = await permissions.query({
          name: 'microphone',
        });
        if (permissionInfo.state === 'prompt') {
          try {
            await window.navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
          } catch (error) {
            mainLogger.info(
              `${logTag}Audio permission is denied: ${error.name}[${
                error.message
              }]`,
            );
            const allowed = error.name !== 'NotAllowedError';
            if (!allowed) {
              onPermissionDenied();
            }
            return allowed;
          }
        } else if (permissionInfo.state === 'denied') {
          mainLogger.info(`${logTag}Audio permission is denied`);
          onPermissionDenied();
          return false;
        }

        return true;
      },
    };

    this._settingService.registerPage(this._scope, {
      id: SETTING_PAGE__NOTIFICATION_SOUND,
      automationId: 'notificationAndSounds',
      icon: 'bell',
      title: 'setting.notificationAndSounds.title',
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
              ...baseDeviceSettingItem,
              id: SETTING_ITEM__MICROPHONE_SOURCE,
              automationId: 'microphoneSource',
              title: 'setting.audioSource.microphoneSource.label',
              description: 'setting.audioSource.microphoneSource.description',
              defaultSource: DEFAULT_AUDIO_INPUT_DEVICES,
              weight: 0,
            } as SelectSettingItem<MediaDeviceInfo>,
            {
              ...baseDeviceSettingItem,
              id: SETTING_ITEM__SPEAKER_SOURCE,
              automationId: 'speakerSource',
              title: 'setting.audioSource.speakerSource.label',
              description: 'setting.audioSource.speakerSource.description',
              defaultSource: DEFAULT_AUDIO_OUTPUT_DEVICES,
              weight: 100,
            } as SelectSettingItem<MediaDeviceInfo>,
            {
              ...baseDeviceSettingItem,
              id: SETTING_ITEM__RINGER_SOURCE,
              automationId: 'ringerSource',
              title: 'setting.audioSource.ringerSource.label',
              description: 'setting.audioSource.ringerSource.description',
              defaultSource: DEFAULT_AUDIO_OUTPUT_DEVICES,
              weight: 200,
            } as SelectSettingItem<MediaDeviceInfo>,
            {
              id: SETTING_ITEM__VOLUME,
              automationId: 'volume',
              title: 'setting.audioSource.volume.label',
              description: 'setting.audioSource.volume.description',
              type: SETTING_ITEM_TYPE.SLIDER,
              Left: SpeakerMuteIcon,
              Right: SpeakerIcon,
              valueLabelFormat: value => `${Math.ceil(value * 100)}%`,
              min: 0,
              max: 1,
              step: 0.01,
              weight: 300,
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
