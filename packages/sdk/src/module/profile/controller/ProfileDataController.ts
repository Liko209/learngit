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
import { VIDEO_SERVICE_OPTIONS, SETTING_KEYS } from '../constants';
import { ConversationPreference } from '../entity/Profile';
import { ConversationPreferenceHandler } from './ConversationPreferenceHandler';
import { ProfileEntityObservable } from './ProfileEntityObservable';

class ProfileDataController {
  private _conversationPreferenceHandler: ConversationPreferenceHandler;
  constructor(
    public entitySourceController: IEntitySourceController<Profile>,
    public entityCacheController: IEntityCacheController<Profile>,
    public profileEntityObservable: ProfileEntityObservable,
  ) {
    this._registerObservers();
  }

  private _registerObservers() {
    this._conversationPreferenceHandler = new ConversationPreferenceHandler([
      SETTING_KEYS.CONVERSATION_AUDIO,
      SETTING_KEYS.CONVERSATION_NOTIFICATION,
    ]);
    this.profileEntityObservable.register(this._conversationPreferenceHandler);
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

  async isNotificationMute(cid: number) {
    const model = await this.getConversationPreference(cid);
    if (model.muted) {
      return true;
    }
    return !model.desktopNotifications;
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
              this.profileEntityObservable.onProfileUpdate(transformedData);
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

  unRegisterAllObservers() {
    this.profileEntityObservable.unRegisterAll();
  }

  async getConversationPreference(
    cid: number,
  ): Promise<ConversationPreference> {
    const profile = await this.getProfile();
    return await this._conversationPreferenceHandler.buildEntityInfo(
      profile,
      cid,
    );
  }
}

export { ProfileDataController };
