/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-04 10:47:06
 * Copyright © RingCentral. All rights reserved.
 */

import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { Raw } from '../../../framework/model';
import { Profile } from '../entity';
import { NOTIFICATION_OPTIONS, SETTING_KEYS } from '../constants';
import { SettingOption } from '../types';
import { ProfileDataController } from './ProfileDataController';
import { ConversationPreference } from '../entity/Profile';

class SettingsActionController {
  constructor(
    private _partialModifyController: IPartialModifyController<Profile>,
    private _requestController: IRequestController<Profile>,
    private _profileDataController: ProfileDataController,
  ) {}

  async updateSettingOptions(options: SettingOption[]) {
    const updateProfile: Partial<Profile> = {};
    options.forEach((option: SettingOption) => {
      if (
        option.key === SETTING_KEYS.MAX_LEFTRAIL_GROUP &&
        typeof option.value === 'number'
      ) {
        option.value = option.value.toString();
      }
      if (
        typeof option.value === 'boolean' &&
        option.key !== SETTING_KEYS.DESKTOP_NOTIFICATION
      ) {
        option.value = option.value
          ? NOTIFICATION_OPTIONS.ON
          : NOTIFICATION_OPTIONS.OFF;
      }
      updateProfile[option.key] = option.value;
    });

    const profileId = this._profileDataController.getCurrentProfileId();
    if (profileId) {
      const preHandlePartial = (
        partialModel: Partial<Raw<Profile>>,
      ): Partial<Raw<Profile>> => {
        const result = {
          ...updateProfile,
          ...partialModel,
        };
        return result;
      };
      await this._partialModifyController.updatePartially({
        entityId: profileId,
        preHandlePartialEntity: preHandlePartial,
        doUpdateEntity: async (newProfile: Profile) =>
          await this._requestController.put(newProfile),
      });
    }
  }

  async updateSettingByGroupId(
    cid: number,
    model: Partial<ConversationPreference>,
  ) {
    const profile = await this._profileDataController.getProfile();
    const { sound_notifications, ...notification } = model;
    const allNotification =
      (profile && profile.conversation_level_notifications) || {};
    const allSound =
      (profile && profile.team_specific_audio_notifications) || [];
    allNotification[cid] = notification;
    const data = [
      { key: SETTING_KEYS.CONVERSATION_NOTIFICATION, value: allNotification },
      {
        key: SETTING_KEYS.CONVERSATION_SOUND,
        value: allSound.map(item => {
          if (
            item.gid === cid &&
            sound_notifications &&
            sound_notifications.id
          ) {
            item.sound = sound_notifications.id;
          }
          return item;
        }),
      },
    ];
    this.updateSettingOptions(data);
  }
}

export { SettingsActionController };
