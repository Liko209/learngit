/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:27
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { IProfileService } from './IProfileService';
import { Profile } from '../entity/Profile';
import { daoManager } from '../../../dao';
import { ProfileDao } from '../dao';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET, SERVICE } from '../../../service/eventKey';
import { Raw } from '../../../framework/model/Raw';
import { ProfileController } from '../controller/ProfileController';
import { SYNC_SOURCE } from '../../../module/sync/types';

class ProfileService extends EntityBaseService<Profile>
  implements IProfileService {
  static serviceName = 'ProfileService';

  private profileController: ProfileController;

  constructor() {
    super(false, daoManager.getDao(ProfileDao), {
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
  }

  handleIncomingData = async (
    profile: Raw<Profile> | null,
    source: SYNC_SOURCE,
  ) => {
    await this.getProfileController()
      .getProfileDataController()
      .profileHandleData(profile, source);
  }

  handleGroupIncomesNewPost = async (groupIds: number[]) => {
    this.getProfileController()
      .getProfileActionController()
      .handleGroupIncomesNewPost(groupIds);
  }

  getProfileController(): ProfileController {
    if (!this.profileController) {
      this.profileController = new ProfileController(this.getEntitySource());
    }
    return this.profileController;
  }

  async getProfile(): Promise<Profile> {
    return await this.getProfileController()
      .getProfileDataController()
      .getProfile();
  }

  async getMaxLeftRailGroup(): Promise<number> {
    return await this.getProfileController()
      .getProfileDataController()
      .getMaxLeftRailGroup();
  }

  async isConversationHidden(groupId: number) {
    return await this.getProfileController()
      .getProfileDataController()
      .isConversationHidden(groupId);
  }

  async reorderFavoriteGroups(
    oldIndex: number,
    newIndex: number,
  ): Promise<Profile | null> {
    return await this.getProfileController()
      .getProfileActionController()
      .reorderFavoriteGroups(oldIndex, newIndex);
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
}

export { ProfileService };
