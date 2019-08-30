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
import _ from 'lodash';

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

  async updateConversationPreference(
    cid: number,
    model: Partial<ConversationPreference>,
  ) {
    const updateData: SettingOption[] = [];
    const profile = await this._profileDataController.getLocalProfile();
    const { audioNotifications, ...notification } = model;
    const originNotification =
      (profile && profile[SETTING_KEYS.CONVERSATION_NOTIFICATION]) || {};
    const originAudio =
      (profile && profile[SETTING_KEYS.CONVERSATION_AUDIO]) || [];

    if (notification) {
      updateData.push({
        key: SETTING_KEYS.CONVERSATION_NOTIFICATION,
        value: {
          ...originNotification,
          [cid]: {
            ...originNotification[cid],
            ...this.getNotification(notification),
          },
        },
      });
    }
    if (audioNotifications) {
      let audios = _.cloneDeep(originAudio);
      if (audios.find(item => item.gid === cid)) {
        audios = audios.map(item => {
          if (item.gid === cid) {
            item.sound = audioNotifications.id;
          }
          return item;
        });
      } else {
        audios.push({ gid: cid, sound: audioNotifications.id });
      }

      updateData.push({
        key: SETTING_KEYS.CONVERSATION_AUDIO,
        value: audios,
      });
    }
    await this.updateSettingOptions(updateData);
  }
  private getNotification(notification: Partial<ConversationPreference>) {
    const keyMap = {
      muted: 'muted',
      desktopNotifications: 'desktop_notifications',
      pushNotifications: 'push_notifications',
      emailNotifications: 'email_notifications',
    };
    const result = {};
    Object.keys(notification).map(key => {
      if (notification[key] !== undefined) {
        result[keyMap[key]] = notification[key];
      }
    });
    return result;
  }
}

export { SettingsActionController };
