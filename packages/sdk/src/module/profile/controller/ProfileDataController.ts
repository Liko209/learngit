/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:39:28
 * Copyright © RingCentral. All rights reserved.
 */

import { Profile } from '../entity';
import { AccountService } from '../../account/service';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { JSdkError } from '../../../error/sdk/JSdkError';
import { ERROR_CODES_SDK } from '../../../error/sdk/types';
import { Raw } from '../../../framework/model/Raw';
import notificationCenter from '../../../service/notificationCenter';
import { mainLogger } from 'foundation/log';
import { ENTITY } from '../../../service/eventKey';
import _ from 'lodash';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Nullable } from 'sdk/types';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import {
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  VIDEO_SERVICE_OPTIONS,
  SOUNDS_TYPE,
  SoundsList,
} from '../constants';
import GroupService from 'sdk/module/group';
import { ConversationPreference } from '../entity/Profile';

class ProfileDataController {
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
    public entityCacheController: IEntityCacheController<Profile>,
  ) {
  }

  get settingService() {
    return ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
  }

  async profileHandleData(
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<Profile | null> {
    let result: Profile | null = null;
    if (profile) {
      if (_.isArray(profile)) {
        result = await this._handleProfile(profile[0], source, changeMap);
      } else {
        result = await this._handleProfile(profile, source, changeMap);
      }
    }
    return result;
  }

  getCurrentProfileId(): number {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getCurrentUserProfileId();
  }

  async getLocalProfile(): Promise<Nullable<Profile>> {
    const profileId = this.getCurrentProfileId();
    if (!profileId) {
      return null;
    }

    const profile = await this.entityCacheController.get(profileId);
    return profile;
  }

  async getProfile(): Promise<Nullable<Profile>> {
    const profileId = this.getCurrentProfileId();
    if (!profileId) {
      return null;
    }

    const profile = await this.entitySourceController.get(profileId);
    if (!profile) {
      // Current user profile not found is a unexpected error,
      // the error should be throw to tell developer that there
      // must be some bug happened.
      throw new JSdkError(
        ERROR_CODES_SDK.GENERAL,
        `ServiceError: Can not find current profile. profileId: ${profileId}`,
      );
    }
    return profile;
  }

  async isConversationHidden(groupId: number) {
    const profile = await this.getProfile();
    if (profile) {
      const key = `hide_group_${groupId}`;
      return profile[key];
    }
    return false;
  }

  async getFavoriteGroupIds() {
    const profile = await this.getProfile();
    return (profile && profile.favorite_group_ids) || [];
  }
  async _isTeam(conversationId: number) {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const group = await groupService.getById(conversationId);
    return !!(group && group.is_team);
  }
  async _getGlobalDesktopNotification(conversationId: number) {
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<
      DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
    >(SettingEntityIds.Notification_NewMessages);
    const value = model && model.value;
    let isMute;
    switch (value) {
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE:
        isMute = false;
        break;
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF:
        isMute = true;
        break;
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION:
      default:
        isMute = await this._isTeam(conversationId);
        break;
    }
    return isMute;
  }

  async isNotificationMute(conversationId: number) {
    const profile = await this.getProfile();
    const notification =
      profile &&
      profile.conversation_level_notifications &&
      profile.conversation_level_notifications[conversationId];
    if (!notification) {
      return this._getGlobalDesktopNotification(conversationId);
    }
    if (notification.muted) {
      return true;
    }
    if (notification.desktop_notifications === undefined) {
      return this._getGlobalDesktopNotification(conversationId);
    }
    return !notification.desktop_notifications;
  }

  async isVideoServiceEnabled(option: VIDEO_SERVICE_OPTIONS): Promise<boolean> {
    const profile = await this.getProfile();
    return _.get(profile, 'video_service') === option;
  }

  private async _handleProfile(
    profile: Raw<Profile>,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<Profile | null> {
    try {
      if (profile) {
        const local = await this.getLocalProfile();
        if (local && local.modified_at >= profile.modified_at) {
          return local;
        }
        const transformedData: Profile = transform(profile);
        if (transformedData) {
          await this.entitySourceController.put(transformedData);
          if (shouldEmitNotification(source)) {
            if (changeMap) {
              changeMap.set(ENTITY.PROFILE, { entities: [transformedData] });
            } else {
              notificationCenter.emitEntityUpdate(ENTITY.PROFILE, [
                transformedData,
              ]);
            }
          }
          return transformedData;
        }
      }
      return null;
    } catch (e) {
      mainLogger.warn(`handleProfile error:${e}`);
      return null;
    }
  }

  async getByGroupId(cid: number): Promise<ConversationPreference> {
    const profile = await this.getProfile();
    const notification =
      profile &&
      profile.conversation_level_notifications &&
      profile.conversation_level_notifications[cid];
    const sound = (
      (profile && profile.team_specific_audio_notifications) ||
      []
    ).find(item => item.gid === cid);
    let model: ConversationPreference = {
      ...notification,
      muted: (notification && notification.muted) || false,
      sound_notifications:
        sound && SoundsList.find(item => item.id === sound.sound),
    };
    if (this._isTeam(cid)) {
      model = await this._getTeamSetting(model);
    } else {
      model = await this._getDMSetting(model);
    }
    // 0 is string or number

    return model;
  }

  private async _getSettingValue<T>(settingId: SettingEntityIds) {
    const model = await this.settingService.getById<T>(settingId);
    return (model && model.value)!;
  }

  private async _getTeamSetting(model: ConversationPreference) {
    if (
      !model.sound_notifications ||
      model.sound_notifications.id === SOUNDS_TYPE.Default
    ) {
      model.sound_notifications = await this._getSettingValue(
        SettingEntityIds.Audio_TeamMessages,
      );
    }
    if (!model.desktop_notifications) {
      const value = await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      );
      model.desktop_notifications =
        value === DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE;
    }
    if (!model.email_notifications) {
      model.email_notifications = await this._getSettingValue(
        SettingEntityIds.Notification_Teams,
      );
    }
    if (!model.push_notifications) {
      model.push_notifications = await this._getSettingValue(
        SettingEntityIds.MOBILE_Team,
      );
    }
    return model;
  }

  private async _getDMSetting(model: ConversationPreference) {
    if (
      !model.sound_notifications ||
      model.sound_notifications.id === SOUNDS_TYPE.Default
    ) {
      model.sound_notifications = await this._getSettingValue(
        SettingEntityIds.Audio_DirectMessage,
      );
    }
    if (!model.desktop_notifications) {
      const value = await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      );
      model.desktop_notifications =
        value !== DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF;
    }
    if (!model.email_notifications) {
      model.email_notifications = await this._getSettingValue(
        SettingEntityIds.Notification_DirectMessages,
      );
    }
    if (!model.push_notifications) {
      model.push_notifications = await this._getSettingValue(
        SettingEntityIds.MOBILE_DM,
      );
    }
    return model;
  }
}

export { ProfileDataController };
