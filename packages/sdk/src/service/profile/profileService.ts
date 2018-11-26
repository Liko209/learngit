/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import ProfileDao from '../../dao/profile';
import ProfileAPI from '../../api/glip/profile';

import BaseService from '../../service/BaseService';
import AccountService from '../account';
import handleData, { handlePartialProfileUpdate } from './handleData';
import { Profile, Raw } from '../../models';
import { SOCKET, SERVICE } from '../eventKey';
import _ from 'lodash';
import { BaseError, ErrorParser } from '../../utils';
import { mainLogger } from 'foundation';
import { transform } from '../utils';
import PersonService from '../person';

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

  async getProfile(): Promise<Profile | null> {
    const profileId: number | null = this.getCurrentProfileId();
    if (!profileId) {
      return null;
    }
    return this.getById(profileId);
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

  private async _putProfileAndHandle(
    profile: Profile,
    oldKey: string,
    oldValue: any,
  ): Promise<Profile | null> {
    profile._id = profile.id;
    delete profile.id;
    const response = await ProfileAPI.putDataById<Profile>(
      profile._id,
      profile,
    );
    let result: Profile | null;
    if (response.isOk()) {
      result = await handlePartialProfileUpdate(response.data, oldKey);
    } else {
      // roll back
      profile[oldKey] = oldValue;
      result = await handlePartialProfileUpdate(
        profile as Raw<Profile>,
        oldKey,
      );
    }
    if (result) {
      return result;
    }
    return null;
  }

  async reorderFavoriteGroups(oldIndex: number, newIndex: number) {
    const profileId: number | null = this.getCurrentProfileId();
    if (!profileId) {
      return ErrorParser.parse('none profile error');
    }

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

    return await this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      this._doUpdateModel.bind(this),
    );
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    const profileId: number | null = this.getCurrentProfileId();
    if (!profileId) {
      return ErrorParser.parse('none profile error');
    }

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

    return await this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      this._doUpdateModel.bind(this),
    );
  }

  private async _doUpdateModel(updatedModel: Profile) {
    return await this._requestUpdateProfile(updatedModel);
  }

  async markMeConversationAsFav(): Promise<Profile | BaseError> {
    const { me_tab = false } = (await this.getProfile()) || {};
    if (me_tab) {
      return ErrorParser.parse('does not need mark me');
    }
    const accountService = AccountService.getInstance<AccountService>();
    const currentId = accountService.getCurrentUserId();

    if (!currentId) {
      mainLogger.warn('please make sure that currentId is available');
      return ErrorParser.parse('none current user id');
    }

    const profileId: number | null = this.getCurrentProfileId();
    if (!profileId) {
      return ErrorParser.parse('none profile error');
    }
    const personService = await PersonService.getInstance<PersonService>();
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
        if (favIds.indexOf(currentId) === -1) {
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
    return new BaseError(500, 'getById failed');
  }

  async putFavoritePost(
    postId: number,
    toBook: boolean,
  ): Promise<Profile | null> {
    const profile = await this.getProfile();
    if (profile) {
      const oldFavPostIds = profile.favorite_post_ids || [];
      let newFavPostIds = oldFavPostIds;
      if (toBook) {
        if (oldFavPostIds.indexOf(postId) === -1) {
          newFavPostIds.push(postId);
        } else {
          return profile;
        }
      } else {
        if (oldFavPostIds.indexOf(postId) !== -1) {
          newFavPostIds = oldFavPostIds.filter((id: number) => id !== postId);
        } else {
          return profile;
        }
      }
      profile.favorite_post_ids = newFavPostIds;
      return this._putProfileAndHandle(
        profile,
        'favorite_post_ids',
        oldFavPostIds,
      );
    }
    // error
    return profile;
  }

  getCurrentProfileId() {
    const accountService: AccountService = AccountService.getInstance();
    const profileId: number | null = accountService.getCurrentUserProfileId();
    return profileId;
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
  ): Promise<Profile | BaseError> {
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

    return await this._updateProfileGroupStatus(preHandlePartialModel);
  }

  async isConversationHidden(groupId: number) {
    const profile = await this.getProfile();
    if (profile) {
      const key = `hide_group_${groupId}`;
      return profile[key];
    }
    return false;
  }

  private async _updateProfileGroupStatus(
    preHandlePartialModel?: (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ) => Partial<Raw<Profile>>,
  ) {
    const profileId: number | null = this.getCurrentProfileId();
    if (!profileId) {
      return ErrorParser.parse('none profile error');
    }

    const partialProfile: any = {
      id: profileId,
      _id: profileId,
    };

    return await this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      this._doUpdateModel.bind(this),
    );
  }

  private async _requestUpdateProfile(
    newProfile: Profile,
    handleDataFunc?: (profile: Raw<Profile> | null) => Promise<Profile | null>,
  ): Promise<Profile | BaseError> {
    newProfile._id = newProfile.id;
    delete newProfile.id;
    try {
      const response = await ProfileAPI.putDataById<Profile>(
        newProfile._id,
        newProfile,
      );

      const data = response.expect('profile put dat failed');

      if (data) {
        if (handleDataFunc) {
          const result = await handleDataFunc(data);
          if (result) {
            return result;
          }
        } else {
          const latestProfileModel: Profile = transform(data);
          return latestProfileModel;
        }
      }
      return ErrorParser.parse(response);
    } catch (e) {
      return ErrorParser.parse(e);
    }
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
