/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 10:26:57
 */
import ProfileDao from '../../dao/profile';
import ProfileAPI from '../../api/glip/profile';

import BaseService from '../../service/BaseService';
import AccountService from '../account';
import handleData, {
  handlePartialProfileUpdate,
  doNotification,
} from './handleData';
import { Profile, Raw } from '../../models';
import { SOCKET, SERVICE, ENTITY } from '../eventKey';
import _ from 'lodash';
import { BaseError, ErrorParser } from '../../utils';
import PersonService from '../person';
import { mainLogger } from 'foundation';
import notificationCenter from '../../service/notificationCenter';
import { transform } from '../utils';

const handleGroupIncomesNewPost = (groupIds: number[]) => {
  const profileService: ProfileService = ProfileService.getInstance();
  profileService.handleGroupIncomesNewPost(groupIds);
};

export default class ProfileService extends BaseService<Profile> {
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
    if (response.data) {
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
    const profile = await this.getProfile();
    if (profile) {
      const oldFavGroupIds = profile.favorite_group_ids || [];
      const newFavGroupIds = this._reorderFavoriteGroupIds(
        oldIndex,
        newIndex,
        oldFavGroupIds,
      );
      profile.favorite_group_ids = newFavGroupIds;
      return this._putProfileAndHandle(
        profile,
        'favorite_group_ids',
        oldFavGroupIds,
      );
    }
    return null;
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    const profile = await this.getProfile();
    if (profile) {
      const favIds = profile.favorite_group_ids || [];
      let newIds: number[] = [];
      if (markAsFavorite) {
        if (favIds.indexOf(groupId) === -1) {
          newIds = [groupId].concat(favIds);
        } else {
          return profile;
        }
      } else {
        if (favIds.indexOf(groupId) !== -1) {
          newIds = favIds.filter(id => id !== groupId);
        } else {
          return profile;
        }
      }
      profile.favorite_group_ids = newIds;
      return this._putProfileAndHandle(profile, 'favorite_group_ids', favIds);
    }
    return profile;
  }
  async markMeConversationAsFav(): Promise<Profile | null> {
    const { me_tab = false } = (await this.getProfile()) || {};
    if (me_tab) {
      return null;
    }
    const accountService = await AccountService.getInstance<AccountService>();
    const currentId = accountService.getCurrentUserId();
    if (!currentId) {
      mainLogger.warn('please make sure that currentId is available');
      return null;
    }
    const personService = await PersonService.getInstance<PersonService>();
    const { me_group_id } = await personService.getById(currentId);
    const profile = await this.markGroupAsFavorite(me_group_id, true);
    if (profile) {
      profile.me_tab = true;
      return this._putProfileAndHandle(profile, 'me_tab', false);
    }
    return null;
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
      let partialProfile = partialModel;
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

    return await this._updateProfileGroupStatus(
      groupIds,
      false,
      preHandlePartialModel,
    );
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

    return await this._updateProfileGroupStatus(
      [groupId],
      hidden,
      preHandlePartialModel,
    );
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
    groupIds: number[],
    hidden: boolean,
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

    const doUpdateModel = async (updatedModel: Profile) => {
      return await this._doUpdateProfile(updatedModel);
    };

    const doPartialNotify = (
      originalModels: Profile[],
      partialModels: Partial<Raw<Profile>>[],
    ): void => {
      notificationCenter.emitEntityPartialUpdate(ENTITY.PROFILE, partialModels);

      doNotification(
        originalModels[0],
        this.getMergedModel(partialModels[0], originalModels[0]),
      );
    };

    return await this.handlePartialUpdate(
      partialProfile,
      preHandlePartialModel,
      doUpdateModel,
      doPartialNotify,
    );
  }

  private async _doUpdateProfile(
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

      if (response.data) {
        if (handleDataFunc) {
          const result = await handleDataFunc(response.data);
          if (result) {
            return result;
          }
        } else {
          const latestProfileModel: Profile = transform(response.data);
          return latestProfileModel;
        }
      }
      return ErrorParser.parse(response);
    } catch (e) {
      return ErrorParser.parse(e);
    }
  }
}
