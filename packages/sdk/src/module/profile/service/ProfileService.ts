/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:27
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { IProfileService } from './IProfileService';
import { Profile, ConversationPreference } from '../entity/Profile';
import { daoManager } from '../../../dao';
import { ProfileDao } from '../dao';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET, SERVICE } from '../../../service/eventKey';
import { Raw } from '../../../framework/model/Raw';
import { ProfileController } from '../controller/ProfileController';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { SettingOption } from '../types';
import { ProfileSetting } from '../setting';
import { SettingService } from 'sdk/module/setting';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Nullable } from 'sdk/types';
import { VIDEO_SERVICE_OPTIONS } from '../constants';

class ProfileService extends EntityBaseService<Profile>
  implements IProfileService {
  private profileController: ProfileController;
  private _profileSetting: ProfileSetting;
  constructor() {
    super({ isSupportedCache: true }, daoManager.getDao(ProfileDao), {
      basePath: '/profile',
      networkClient: Api.glipNetworkClient,
    });

    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.PROFILE]: this.handleIncomingData,
        [SERVICE.POST_SERVICE.NEW_POST_TO_GROUP]: this
          .handleGroupIncomesNewPost,
      }),
    );

    this.setCheckTypeFunc((id: number) =>
      GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PROFILE),
    );
  }

  protected onStarted() {
    super.onStarted();
    ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    ).registerModuleSetting(this.profileSetting);
  }

  protected onStopped() {
    if (this._profileSetting) {
      ServiceLoader.getInstance<SettingService>(
        ServiceConfig.SETTING_SERVICE,
      ).unRegisterModuleSetting(this._profileSetting);
      delete this._profileSetting;
    }
    this.getProfileController()
      .getProfileDataController()
      .unRegisterAllObservers();

    super.onStopped();
  }

  handleIncomingData = async (
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ) => {
    await this.getProfileController()
      .getProfileDataController()
      .profileHandleData(profile, source, changeMap);
  };

  handleGroupIncomesNewPost = async (groupIds: number[]) => {
    this.getProfileController()
      .getProfileActionController()
      .handleGroupIncomesNewPost(groupIds);
  };

  getProfileController(): ProfileController {
    if (!this.profileController) {
      this.profileController = new ProfileController(
        this.getEntitySource(),
        this.getEntityCacheController(),
      );
    }
    return this.profileController;
  }

  async getProfile(): Promise<Nullable<Profile>> {
    return await this.getProfileController()
      .getProfileDataController()
      .getProfile();
  }

  async isConversationHidden(groupId: number) {
    return await this.getProfileController()
      .getProfileDataController()
      .isConversationHidden(groupId);
  }

  async reorderFavoriteGroups(
    favIds: number[],
    oldIndex: number,
    newIndex: number,
  ): Promise<Profile | null> {
    return await this.getProfileController()
      .getProfileActionController()
      .reorderFavoriteGroups(favIds, oldIndex, newIndex);
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    return await this.getProfileController()
      .getProfileActionController()
      .markGroupAsFavorite(groupId, markAsFavorite);
  }

  async markMeConversationAsFav() {
    return await this.getProfileController()
      .getProfileActionController()
      .markMeConversationAsFav();
  }

  async putFavoritePost(postId: number, toBook: boolean) {
    return await this.getProfileController()
      .getProfileActionController()
      .putFavoritePost(postId, toBook);
  }

  async reopenConversation(groupId: number) {
    return await this.getProfileController()
      .getProfileActionController()
      .reopenConversation(groupId);
  }

  async hideConversation(
    groupId: number,
    hidden: boolean,
    shouldUpdateSkipConfirmation: boolean,
  ) {
    return await this.getProfileController()
      .getProfileActionController()
      .hideConversation(groupId, hidden, shouldUpdateSkipConfirmation);
  }

  async getFavoriteGroupIds() {
    return await this.getProfileController()
      .getProfileDataController()
      .getFavoriteGroupIds();
  }

  async updateSettingOptions(options: SettingOption[]) {
    await this.getProfileController()
      .getSettingsActionController()
      .updateSettingOptions(options);
  }

  async isNotificationMute(conversationId: number) {
    return await this.getProfileController()
      .getProfileDataController()
      .isNotificationMute(conversationId);
  }

  isVideoServiceEnabled(option: VIDEO_SERVICE_OPTIONS): Promise<boolean> {
    return this.getProfileController()
      .getProfileDataController()
      .isVideoServiceEnabled(option);
  }

  getConversationPreference = async (
    cid: number,
  ): Promise<ConversationPreference> => {
    return await this.getProfileController()
      .getProfileDataController()
      .getConversationPreference(cid);
  };

  async updateConversationPreference(
    cid: number,
    model: Partial<ConversationPreference>,
  ): Promise<void> {
    await this.getProfileController()
      .getSettingsActionController()
      .updateConversationPreference(cid, model);
  }

  private get profileSetting() {
    if (!this._profileSetting) {
      this._profileSetting = new ProfileSetting(
        this,
        ServiceLoader.getInstance(ServiceConfig.ACCOUNT_SERVICE),
        ServiceLoader.getInstance(ServiceConfig.SETTING_SERVICE),
      );
    }
    return this._profileSetting;
  }
}

export { ProfileService };
