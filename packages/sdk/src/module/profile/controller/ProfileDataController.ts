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
import { mainLogger } from 'foundation';
import { ENTITY } from '../../../service/eventKey';
import _ from 'lodash';
import { transform } from '../../../service/utils';
import { shouldEmitNotification } from '../../../utils/notificationUtils';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { Nullable } from 'sdk/types';
import { IEntityCacheController } from 'sdk/framework/controller/interface/IEntityCacheController';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from '../constants';
import GroupService from 'sdk/module/group';

class ProfileDataController {
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
    public entityCacheController: IEntityCacheController<Profile>,
  ) {}

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
  async _getGlobalSetting(conversationId: number) {
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<
      DESKTOP_MESSAGE_NOTIFICATION_OPTIONS
    >(SettingEntityIds.Notification_NewMessages);
    const value = model && model.value;
    let shouldNotification;
    switch (value) {
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE:
        shouldNotification = false;
        break;
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF:
        shouldNotification = true;
        break;
      case DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION:
      default:
        shouldNotification = this._isTeam(conversationId) ? true : false;
        break;
    }
    return shouldNotification;
  }

  async isNotificationMute(conversationId: number) {
    const profile = await this.getProfile();
    const notification =
      profile &&
      profile.conversation_level_notifications &&
      profile.conversation_level_notifications[conversationId];
    if (!notification) {
      return this._getGlobalSetting(conversationId);
    }
    if (notification.mute) {
      return true;
    }
    if (notification.desktop_notifications === undefined) {
      return this._getGlobalSetting(conversationId);
    }
    return !notification.desktop_notifications;
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
}

export { ProfileDataController };
