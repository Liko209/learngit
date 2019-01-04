/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import ProfileDao from '../../dao/profile';
import ProfileAPI from '../../api/glip/profile';

import BaseService from '../../service/BaseService';
import AccountService from '../account';
import { Profile } from '../../module/profile/entity';
import { Raw } from '../../framework/model';
import { SOCKET, SERVICE } from '../eventKey';
import { ServiceResult, serviceErr, serviceOk } from '../ServiceResult';
import { transform } from '../utils';
import PersonService from '../person';
import handleData from './handleData';
import { JSdkError, ERROR_CODES_SDK, JError } from '../../error';

const handleGroupIncomesNewPost = (groupIds: number[]) => {
  const profileService: ProfileService = ProfileService.getInstance();
  profileService.handleGroupIncomesNewPost(groupIds);
};

const DEFAULT_LEFTRAIL_GROUP: number = 20;

class ProfileService extends BaseService<Profile> {
  static serviceName = 'ProfileService';
  constructor() {
    const subscriptions = {
      [SOCKET.PROFILE]: handleData,
      [SERVICE.POST_SERVICE.NEW_POST_TO_GROUP]: handleGroupIncomesNewPost,
    };
    super(ProfileDao, ProfileAPI, handleData, subscriptions);
  }

  async getProfile(): Promise<Profile> {
    const profileId = this.getCurrentProfileId();
    const profile = await this.getById(profileId);
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

  private _reorderFavoriteGroupIds(
    oldIndex: number,
    newIndex: number,
    ids: number[],
  ): number[] {
    const newOrder = _.cloneDeep(ids);
    const id = newOrder[oldIndex];
    if (oldIndex > newIndex) {
      for (let i = oldIndex; i > newIndex; i -= 1) {
        newOrder[i] = newOrder[i - 1];
      }
    } else {
      for (let i = oldIndex; i < newIndex; i += 1) {
        newOrder[i] = newOrder[i + 1];
      }
    }
    newOrder[newIndex] = id;
    return newOrder;
  }

  async reorderFavoriteGroups(
    oldIndex: number,
    newIndex: number,
  ): Promise<ServiceResult<Profile>> {
    const profileId = this.getCurrentProfileId();

    const partialProfile: any = {
      id: profileId,
      _id: profileId,
    };
    const preHandlePartialModel = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      const favIds = originalModel.favorite_group_ids || [];
      const newFavIds = this._reorderFavoriteGroupIds(
        oldIndex,
        newIndex,
        favIds,
      );
      partialModel['favorite_group_ids'] = newFavIds;
      return partialModel;
    };

    return this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      (updatedProfile: Profile) => this._doUpdateModel(updatedProfile),
    );
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    const profileId = this.getCurrentProfileId();

    const partialProfile: any = {
      id: profileId,
      _id: profileId,
    };

    const preHandlePartialModel = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      const favIds = originalModel.favorite_group_ids || [];
      let newIds: number[] = favIds;
      if (markAsFavorite) {
        if (newIds.indexOf(groupId) === -1) {
          newIds = [groupId].concat(newIds);
        }
      } else {
        if (newIds.indexOf(groupId) !== -1) {
          newIds = newIds.filter(id => id !== groupId);
        }
      }
      partialModel['favorite_group_ids'] = newIds;
      return partialModel;
    };

    const result = await this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      (updatedModel: Profile) => this._doUpdateModel(updatedModel),
    );

    return result;
  }

  private async _doUpdateModel(updatedModel: Profile) {
    return await this._requestUpdateProfile(updatedModel);
  }

  async markMeConversationAsFav(): Promise<ServiceResult<Profile>> {
    const profile = await this.getProfile();

    if (profile.me_tab) {
      // Me conversation already be marked as favorite.
      return serviceOk(profile);
    }

    const accountService = AccountService.getInstance<AccountService>();
    const currentId = accountService.getCurrentUserId();
    const profileId = this.getCurrentProfileId();

    const personService = PersonService.getInstance<PersonService>();
    const result = await personService.getById(currentId);

    if (result) {
      const { me_group_id } = result;
      const partialProfile: any = {
        id: profileId,
        _id: profileId,
      };
      const preHandlePartialModel = (
        partialModel: Partial<Raw<Profile>>,
        originalModel: Profile,
      ): Partial<Raw<Profile>> => {
        const favIds = originalModel.favorite_group_ids || [];
        if (!favIds.includes(me_group_id)) {
          partialModel['favorite_group_ids'] = [me_group_id].concat(favIds);
        }
        partialModel['me_tab'] = true;
        return partialModel;
      };

      return await this.handlePartialUpdate(
        partialProfile,
        preHandlePartialModel,
        this._doUpdateModel.bind(this),
      );
    }

    return serviceErr(
      ERROR_CODES_SDK.GENERAL,
      `personService.getById(${currentId}) failed`,
    );
  }

  async putFavoritePost(
    postId: number,
    toBook: boolean,
  ): Promise<ServiceResult<Profile>> {
    const profile = await this.getProfile();
    if (profile) {
      let oldFavPostIds = _.cloneDeep(profile.favorite_post_ids) || [];
      const shouldDoNothing =
        (toBook && oldFavPostIds.indexOf(postId) !== -1) ||
        (!toBook && oldFavPostIds.indexOf(postId) === -1);
      if (shouldDoNothing) {
        return serviceOk(profile);
      }
      const partialProfile: any = {
        id: profile.id,
        _id: profile.id,
      };
      const preHandlePartialModel = (
        partialModel: Partial<Raw<Profile>>,
        originalModel: Profile,
      ): Partial<Raw<Profile>> => {
        if (toBook) {
          oldFavPostIds.push(postId);
        } else {
          oldFavPostIds = oldFavPostIds.filter(id => id !== postId);
        }
        partialModel.favorite_post_ids = oldFavPostIds;
        return partialModel;
      };

      return await this.handlePartialUpdate(
        partialProfile,
        preHandlePartialModel,
        this._doUpdateModel.bind(this),
      );
    }
    return serviceErr(
      ERROR_CODES_SDK.GENERAL,
      `profileService.putFavoritePost(${postId}) failed`,
    );
  }

  getCurrentProfileId(): number {
    const accountService: AccountService = AccountService.getInstance();
    return accountService.getCurrentUserProfileId();
  }

  async handleGroupIncomesNewPost(groupIds: number[]) {
    if (!groupIds.length) {
      return null;
    }

    const preHandlePartialModel = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      let partialProfile = _.cloneDeep(partialModel);
      groupIds.forEach((id: number) => {
        const key = `hide_group_${id}`;
        if (originalModel[key]) {
          partialProfile = {
            ...partialProfile,
            [key]: false,
          };
        }
      });
      return partialProfile;
    };

    return await this._updateProfileGroupStatus(preHandlePartialModel);
  }

  async hideConversation(
    groupId: number,
    hidden: boolean,
    shouldUpdateSkipConfirmation: boolean,
  ): Promise<ServiceResult<Profile>> {
    const preHandlePartialModel = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      let partialProfile = {
        ...partialModel,
        [`hide_group_${groupId}`]: hidden,
      };
      if (
        originalModel.skip_close_conversation_confirmation !==
        shouldUpdateSkipConfirmation
      ) {
        partialProfile = {
          ...partialProfile,
          skip_close_conversation_confirmation: shouldUpdateSkipConfirmation,
        };
      }

      if (hidden) {
        let favIds = _.cloneDeep(originalModel.favorite_group_ids) || [];
        favIds = favIds.filter((id: number) => id !== groupId);

        partialProfile = {
          ...partialProfile,
          favorite_group_ids: favIds,
        };
      }
      return partialProfile;
    };

    return this._updateProfileGroupStatus(preHandlePartialModel);
  }

  async isConversationHidden(groupId: number) {
    const profile = await this.getProfile();
    if (profile) {
      const key = `hide_group_${groupId}`;
      return profile[key];
    }
    return false;
  }

  async reopenConversation(groupId: number) {
    const preHandlePartialModel = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      const partialProfile = {
        ...partialModel,
        [`hide_group_${groupId}`]: false,
      };
      return partialProfile;
    };

    return this._updateProfileGroupStatus(preHandlePartialModel);
  }

  private async _updateProfileGroupStatus(
    preHandlePartialModel?: (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ) => Partial<Raw<Profile>>,
  ): Promise<ServiceResult<Profile>> {
    const profileId = this.getCurrentProfileId();

    const partialProfile: any = {
      id: profileId,
      _id: profileId,
    };

    return this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      (updatedModel: Profile) => this._doUpdateModel(updatedModel),
    );
  }

  private async _requestUpdateProfile(
    newProfile: Profile,
  ): Promise<Profile | JError> {
    newProfile._id = newProfile.id;
    delete newProfile.id;

    const apiResult = await ProfileAPI.putDataById<Profile>(
      newProfile._id,
      newProfile,
    );

    return apiResult.match({
      Ok: async (rawProfile: Raw<Profile>) => {
        const latestProfileModel: Profile = transform(rawProfile);
        return latestProfileModel;
      },
      Err: (error: JError) => error,
    });
  }

  async getMaxLeftRailGroup(): Promise<number> {
    const profile = await this.getProfile();
    if (profile && profile.max_leftrail_group_tabs2) {
      return profile.max_leftrail_group_tabs2;
    }
    return DEFAULT_LEFTRAIL_GROUP;
  }
}

export { ProfileService };
