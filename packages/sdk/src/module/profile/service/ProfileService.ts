/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:18:27
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { IProfileService } from './IProfileService';
import { Profile } from '../entity/Profile';
import { daoManager, ProfileDao } from '../../../dao';
import { Api } from '../../../api';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { SOCKET, SERVICE } from '../../../service';
import { Raw } from '../../../framework/model/Raw';
import { ProfileController } from '../controller/ProfileController';
import profileHandleData from '../../../service/profile/handleData';

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
        [SERVICE.POST_SERVICE.NEW_POST_TO_GROUP]: this.handleGroupIncomesNewPost,
      }),
    );
  }

  handleIncomingData = async (profile: Raw<Profile> | null) => {
    profileHandleData(profile);
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
    return this.getProfileController()
      .getProfileDataController()
      .getProfile();
  }

  async getMaxLeftRailGroup(): Promise<number> {
    return this.getProfileController()
      .getProfileDataController()
      .getMaxLeftRailGroup();
  }

  async isConversationHidden(groupId: number) {
    return this.getProfileController()
      .getProfileDataController()
      .isConversationHidden(groupId);
  }

  async reorderFavoriteGroups(
    oldIndex: number,
    newIndex: number,
  ): Promise<Profile | null> {
    return this.getProfileController()
      .getProfileActionController()
      .reorderFavoriteGroups(oldIndex, newIndex);
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    return this.getProfileController()
      .getProfileActionController()
      .markGroupAsFavorite(groupId, markAsFavorite);
  }

  async markMeConversationAsFav() {
    return this.getProfileController()
      .getProfileActionController()
      .markMeConversationAsFav();
  }

  async putFavoritePost(postId: number, toBook: boolean) {
    return this.getProfileController()
      .getProfileActionController()
      .putFavoritePost(postId, toBook);
  }

  async reopenConversation(groupId: number) {
    return this.getProfileController()
      .getProfileActionController()
      .reopenConversation(groupId);
  }

  async hideConversation(
    groupId: number,
    hidden: boolean,
    shouldUpdateSkipConfirmation: boolean,
  ) {
    return this.getProfileController()
      .getProfileActionController()
      .hideConversation(groupId, hidden, shouldUpdateSkipConfirmation);
  }
}

export { ProfileService };
