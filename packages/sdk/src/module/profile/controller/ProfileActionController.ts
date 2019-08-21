/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-12 13:39:59
 * Copyright © RingCentral. All rights reserved.
 */
import { Profile } from '../entity';
import { IRequestController } from '../../../framework/controller/interface/IRequestController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { Raw } from '../../../framework/model';
import _ from 'lodash';
import { ProfileDataController } from './ProfileDataController';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { PersonDao } from '../../person/dao/PersonDao';
import { daoManager } from '../../../dao';
import { mainLogger } from 'foundation/log';

const LOG_TAG = '[ProfileActionController]';

class ProfileActionController {
  constructor(
    public partialModifyController: IPartialModifyController<Profile>,
    public requestController: IRequestController<Profile>,
    public profileDataController: ProfileDataController,
  ) {}

  // since there are deleted-group ids in favIds
  // so we do not use `favorite_group_ids` of `originalModel`
  // just use favIds passed from UI, which already been filtered.
  async reorderFavoriteGroups(
    favIds: number[],
    oldIndex: number,
    newIndex: number,
  ): Promise<Profile | null> {
    const profileId = this.profileDataController.getCurrentProfileId();

    const preHandlePartial = (
      partialModel: Partial<Raw<Profile>>,
    ): Partial<Raw<Profile>> => {
      // const favIds = originalModel.favorite_group_ids || [];
      const newFavIds = this._reorderFavoriteGroupIds(
        oldIndex,
        newIndex,
        favIds,
      );
      partialModel['favorite_group_ids'] = newFavIds;
      return partialModel;
    };

    return this.partialModifyController.updatePartially({
      entityId: profileId,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newProfile: Profile) =>
        this.requestController.put(newProfile),
    });
  }

  async markGroupAsFavorite(groupId: number, markAsFavorite: boolean) {
    const profileId = this.profileDataController.getCurrentProfileId();
    const preHandlePartial = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      const favIds = originalModel.favorite_group_ids || [];
      let newIds: number[] = favIds;
      if (markAsFavorite) {
        if (newIds.indexOf(groupId) === -1) {
          newIds = [groupId].concat(newIds);
        }
      } else if (newIds.indexOf(groupId) !== -1) {
        newIds = newIds.filter((id: number) => id !== groupId);
      }
      partialModel['favorite_group_ids'] = newIds;
      return partialModel;
    };

    return this.partialModifyController.updatePartially({
      entityId: profileId,
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newProfile: Profile) =>
        this.requestController.put(newProfile),
    });
  }

  async markMeConversationAsFav(): Promise<Profile | null> {
    const profile = await this.profileDataController.getProfile();

    if (profile && profile.me_tab) {
      // Me conversation already be marked as favorite.
      return profile;
    }

    const profileId = this.profileDataController.getCurrentProfileId();

    // should use Person Service to get current user
    // waiting for Person Service refactor
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const currentId = userConfig.getGlipUserId();
    const personDao = daoManager.getDao(PersonDao);
    const result = await personDao.get(currentId);

    if (result) {
      const { me_group_id } = result;
      const preHandlePartial = (
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

      return this.partialModifyController.updatePartially({
        entityId: profileId,
        preHandlePartialEntity: preHandlePartial,
        doUpdateEntity: async (newProfile: Profile) =>
          this.requestController.put(newProfile),
      });
    }
    return null;
  }

  async putFavoritePost(
    postId: number,
    toBook: boolean,
  ): Promise<Profile | null> {
    if (postId === null || postId === undefined) {
      mainLogger.tags(LOG_TAG).error('putFavoritePost() postId is invalid');
      throw new Error('The bookmark post id is invalid');
    }
    const profile = await this.profileDataController.getProfile();
    if (profile) {
      let oldFavPostIds =
        (profile.favorite_post_ids &&
          profile.favorite_post_ids.filter(
            (id: number) => id !== null && id !== undefined,
          )) ||
        [];
      const shouldDoNothing =
        (toBook && oldFavPostIds.indexOf(postId) !== -1) ||
        (!toBook && oldFavPostIds.indexOf(postId) === -1);
      if (shouldDoNothing) {
        return profile;
      }

      const preHandlePartial = (
        partialModel: Partial<Raw<Profile>>,
      ): Partial<Raw<Profile>> => {
        if (toBook) {
          oldFavPostIds.unshift(postId);
        } else {
          oldFavPostIds = oldFavPostIds.filter((id: number) => id !== postId);
        }
        partialModel.favorite_post_ids = oldFavPostIds;
        return partialModel;
      };

      return await this.partialModifyController.updatePartially({
        entityId: this.profileDataController.getCurrentProfileId(),
        preHandlePartialEntity: preHandlePartial,
        doUpdateEntity: async (newProfile: Profile) =>
          this.requestController.put(newProfile),
      });
    }
    return null;
  }

  async reopenConversation(groupId: number) {
    const preHandlePartial = (
      partialModel: Partial<Raw<Profile>>,
      originalModel: Profile,
    ): Partial<Raw<Profile>> => {
      const partialProfile = partialModel;
      if (originalModel[`hide_group_${groupId}`]) {
        partialProfile[`hide_group_${groupId}`] = false;
      }
      return partialProfile;
    };

    return this.partialModifyController.updatePartially({
      entityId: this.profileDataController.getCurrentProfileId(),
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newProfile: Profile) =>
        this.requestController.put(newProfile),
    });
  }

  async hideConversation(
    groupId: number,
    hidden: boolean,
    shouldUpdateSkipConfirmation: boolean,
  ): Promise<Profile | null> {
    const preHandlePartial = (
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

    return this.partialModifyController.updatePartially({
      entityId: this.profileDataController.getCurrentProfileId(),
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newProfile: Profile) =>
        this.requestController.put(newProfile),
    });
  }

  async handleGroupIncomesNewPost(groupIds: number[]) {
    if (!groupIds.length) {
      return null;
    }
    const preHandlePartial = (
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

    return this.partialModifyController.updatePartially({
      entityId: this.profileDataController.getCurrentProfileId(),
      preHandlePartialEntity: preHandlePartial,
      doUpdateEntity: async (newProfile: Profile) =>
        this.requestController.put(newProfile),
    });
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
}
export { ProfileActionController };
