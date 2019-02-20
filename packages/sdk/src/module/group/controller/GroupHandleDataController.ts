/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import _ from 'lodash';

import GroupAPI from '../../../api/glip/group';
import { daoManager, DeactivatedDao } from '../../../dao';
import { Raw } from '../../../framework/model';
import { GroupState, PartialWithKey } from '../../../models';
import { GroupDao } from '../../../module/group/dao';
import { UserConfig } from '../../../service/account';
import { EVENT_TYPES } from '../../../service/constants';
import { ENTITY, SERVICE } from '../../../service/eventKey';
import notificationCenter, {
  NotificationEntityUpdatePayload,
} from '../../../service/notificationCenter';
import ProfileService from '../../../service/profile';
import { extractHiddenGroupIds } from '../../../service/profile/handleData';
import { transform } from '../../../service/utils';
import { Post } from '../../post/entity';
import { Profile } from '../../profile/entity';
import { StateService } from '../../state';
import { Group } from '../entity';

class GroupHandleDataController {
  getExistedAndTransformDataFromPartial = async (
    groups: Partial<Raw<Group>>[],
  ): Promise<Group[]> => {
    const groupDao = daoManager.getDao<GroupDao>(GroupDao);

    const transformedData: (Partial<Group> | null)[] = await Promise.all(
      groups.map(async (item: Partial<Raw<Group>>) => {
        if (item._id) {
          const finalItem = item;
          const existedGroup = await groupDao.get(item._id);
          if (existedGroup) {
            // If existed in DB, update directly and return the updated result for notification later
            type Transformed = PartialWithKey<Group>;
            const transformed: Transformed = transform<Transformed>(finalItem);
            await groupDao.update(transformed);
            if (transformed.id) {
              const updated = await groupDao.get(transformed.id);
              return updated;
            }
          } else {
            // If not existed in DB, request from API and handle the response again
            const result = await GroupAPI.requestGroupById(item._id);
            result.match({
              Ok: data => this.handleData([data]),
              Err: err => mainLogger.error(`${JSON.stringify(err)}`),
            });
          }
        }
        return null;
      }),
    );

    return transformedData.filter(
      (item: Group | null) => item !== null,
    ) as Group[];
  }

  calculateDeltaData = async (
    deltaGroup: Raw<Group>,
  ): Promise<Group | void> => {
    const groupDao = daoManager.getDao<GroupDao>(GroupDao);

    const originData = await groupDao.get(deltaGroup._id);
    if (originData && deltaGroup._delta) {
      const { add, remove, set } = deltaGroup._delta;
      const result = originData;
      if (remove) {
        for (const key in remove) {
          if (remove.hasOwnProperty(key) && originData.hasOwnProperty(key)) {
            result[key] = _.difference(originData[key], remove[key]);
          } else {
            // No a regular delta message if the remove field is not existed,
            // Force end the calculation and return
            return;
          }
        }
      }

      if (add) {
        for (const key in add) {
          if (add.hasOwnProperty(key) && originData.hasOwnProperty(key)) {
            result[key] = _.uniq(_.concat([], originData[key], add[key]));
          } else {
            // No a regular delta message if the add field is not existed
            // Force end the calculation and return
            return;
          }
        }
      }

      if (set) {
        for (const key in set) {
          if (set.hasOwnProperty(key)) {
            result[key] = set[key];
          }
        }
      }
      return result;
    }
  }

  getTransformData = async (groups: Raw<Group>[]): Promise<Group[]> => {
    const transformedData: (Group | null)[] = await Promise.all(
      groups.map(async (item: Raw<Group>) => {
        let finalItem = item;
        /* eslint-disable no-underscore-dangle */
        if (finalItem._delta && item._id) {
          const calculated = await this.calculateDeltaData(item);
          if (calculated) {
            return calculated;
          }
          const result = await GroupAPI.requestGroupById(item._id);
          if (result.isOk()) {
            finalItem = result.data;
          } else {
            return null;
          }
        }
        /* eslint-enable no-underscore-dangle */
        const transformed: Group = transform<Group>(finalItem);

        const beRemovedAsGuest =
          transformed.removed_guest_user_ids &&
          transformed.removed_guest_user_ids.includes(
            UserConfig.getCurrentUserId(),
          );

        if (beRemovedAsGuest) {
          transformed.deactivated = true;
        }

        if (transformed.privacy) {
          transformed.is_public = transformed.privacy === 'protected';
        }

        return transformed;
      }),
    );

    return transformedData.filter(
      (item: Group | null) => item !== null,
    ) as Group[];
  }

  doNotification = async (deactivatedData: Group[], groups: Group[]) => {
    groups.length && notificationCenter.emit(SERVICE.GROUP_CURSOR, groups);
    const deactivatedGroupIds = _.map(deactivatedData, (group: Group) => {
      return group.id;
    });
    deactivatedGroupIds.length &&
      notificationCenter.emitEntityDelete(ENTITY.GROUP, deactivatedGroupIds);
    groups.length && notificationCenter.emitEntityUpdate(ENTITY.GROUP, groups);
  }

  operateGroupDao = async (deactivatedData: Group[], normalData: Group[]) => {
    try {
      const dao = daoManager.getDao(GroupDao);
      if (deactivatedData.length) {
        daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
        dao.bulkDelete(deactivatedData.map(item => item.id));
      }
      if (normalData.length) {
        await dao.bulkUpdate(normalData);
      }
    } catch (e) {
      console.error(`operateGroupDao error ${JSON.stringify(e)}`);
    }
  }

  saveDataAndDoNotification = async (groups: Group[]) => {
    const deactivatedData = groups.filter(
      (item: Group) => item && item.deactivated,
    );
    const normalData = groups.filter(
      (item: Group) => item && !item.deactivated,
    );
    await this.operateGroupDao(deactivatedData, normalData);
    await this.doNotification(deactivatedData, normalData);
    return normalData;
  }

  handleData = async (groups: Raw<Group>[]) => {
    if (groups.length === 0) {
      return;
    }

    const logLabel = `[Performance]grouphandleData ${Date.now()}`;
    console.time(logLabel);
    const transformData = await this.getTransformData(groups);
    const data = transformData.filter(item => item);

    // handle deactivated data and normal data
    await this.saveDataAndDoNotification(data);
    // check all group members exist in local or not if not, should get from remote
    // seems we only need check normal groups, don't need to check deactivated data
    // if (shouldCheckIncompleteMembers) {
    //   await checkIncompleteGroupsMembers(normalGroups);
    // }
    console.timeEnd(logLabel);
  }

  doFavoriteGroupsNotification = async (favIds: number[]) => {
    mainLogger.debug('-------doFavoriteGroupsNotification--------');
    const filteredFavIds = favIds.filter(
      id => typeof id === 'number' && !isNaN(id),
    );

    const replaceGroups = new Map<number, Group>();
    if (filteredFavIds.length) {
      const profileService: ProfileService = ProfileService.getInstance();
      const profile = await profileService.getProfile();
      const hiddenIds = profile ? extractHiddenGroupIds(profile) : [];
      const validFavIds = _.difference(filteredFavIds, hiddenIds);
      const dao = daoManager.getDao(GroupDao);
      let groups = await dao.queryGroupsByIds(validFavIds);
      groups = this.sortFavoriteGroups(validFavIds, groups);

      _.forEach(groups, (group: Group) => {
        replaceGroups.set(group.id, group);
      });
    }
    notificationCenter.emitEntityReplace(ENTITY.FAVORITE_GROUPS, replaceGroups);
  }

  sortFavoriteGroups = (ids: number[], groups: Group[]): Group[] => {
    const result: Group[] = [];
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = 0; j < groups.length; j += 1) {
        if (ids[i] === groups[j].id) {
          result.push(groups[j]);
          break;
        }
      }
    }
    return result;
  }

  handleFavoriteGroupsChanged = async (
    oldProfile: Profile,
    newProfile: Profile,
  ) => {
    mainLogger.debug('---------handleFavoriteGroupsChanged---------');
    if (oldProfile && newProfile) {
      const oldIds = oldProfile.favorite_group_ids || [];
      const newIds = newProfile.favorite_group_ids || [];
      if (oldIds.toString() !== newIds.toString()) {
        const moreFavorites: number[] = _.difference(newIds, oldIds);
        const moreNormals: number[] = _.difference(oldIds, newIds);
        const dao = daoManager.getDao(GroupDao);
        if (moreFavorites.length) {
          const resultGroups: Group[] = await dao.queryGroupsByIds(
            moreFavorites,
          );
          this.doNonFavoriteGroupsNotification(resultGroups, false);
        }
        if (moreNormals.length) {
          const resultGroups = await dao.queryGroupsByIds(moreNormals);
          this.doNonFavoriteGroupsNotification(resultGroups, true);
        }
        await this.doFavoriteGroupsNotification(
          newProfile.favorite_group_ids || [],
        );
      }
    }
  }

  doNonFavoriteGroupsNotification = (groups: Group[], isPut: boolean) => {
    if (isPut) {
      const teams = groups.filter((item: Group) => item.is_team);
      teams.length &&
        notificationCenter.emitEntityUpdate(ENTITY.TEAM_GROUPS, teams);
      const peopleGroups = groups.filter((item: Group) => !item.is_team);
      peopleGroups &&
        notificationCenter.emitEntityUpdate(ENTITY.PEOPLE_GROUPS, peopleGroups);
    } else {
      const teams = groups.filter((item: Group) => item.is_team);
      const teamIds = _.map(teams, (team: Group) => {
        return team.id;
      });
      teamIds &&
        notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teamIds);

      const peopleGroups = groups.filter((item: Group) => !item.is_team);
      const peopleGroupIds = _.map(peopleGroups, (group: Group) => {
        return group.id;
      });
      peopleGroupIds &&
        notificationCenter.emitEntityDelete(
          ENTITY.PEOPLE_GROUPS,
          peopleGroupIds,
        );
    }
  }

  isNeedToUpdateMostRecent4Group = (post: Post, group: Group): boolean => {
    return (
      !group.most_recent_post_created_at ||
      group.most_recent_post_created_at < post.created_at
    );
  }

  getUniqMostRecentPostsByGroup = (posts: Post[]): Post[] => {
    const groupedPosts = _.groupBy(posts, 'group_id');

    const uniqMaxPosts: Post[] = [];
    _.each(groupedPosts, (item: any) => {
      const sortedItem = _.orderBy(item, ['created_at'], ['desc']);
      const maxItem = _.head(sortedItem);
      if (maxItem) {
        uniqMaxPosts.push(maxItem);
      }
    });

    return uniqMaxPosts;
  }

  handleGroupMostRecentPostChanged = async ({
    type,
    body,
  }: NotificationEntityUpdatePayload<Post>) => {
    if (type !== EVENT_TYPES.UPDATE || !body.entities) {
      return;
    }
    const posts: Post[] = [];
    body.entities.forEach((item: Post) => posts.push(item));
    const uniqMaxPosts = this.getUniqMostRecentPostsByGroup(posts);
    const groupDao = daoManager.getDao(GroupDao);
    let validGroups: Partial<Raw<Group>>[] = [];
    const ids: number[] = [];
    await groupDao.doInTransaction(async () => {
      const groups: (null | Partial<Raw<Group>>)[] = await Promise.all(
        uniqMaxPosts.map(async (post: Post) => {
          const group: null | Group = await groupDao.get(post.group_id);
          if (group && this.isNeedToUpdateMostRecent4Group(post, group)) {
            ids.push(post.group_id);
            const pg: Partial<Raw<Group>> = {
              _id: post.group_id,
              most_recent_post_created_at: post.created_at,
              most_recent_content_modified_at: post.modified_at,
              most_recent_post_id: post.id,
            };
            return pg;
          }
          return null;
        }),
      );
      validGroups = groups.filter(item => item !== null) as Partial<
        Raw<Group>
      >[];
    });
    await this.handlePartialData(validGroups);
    ids.length &&
      notificationCenter.emit(SERVICE.POST_SERVICE.NEW_POST_TO_GROUP, ids);
  }

  getGroupTime = (group: Group) => {
    return group.most_recent_post_created_at || group.created_at;
  }

  hasUnread = (groupState: GroupState) => {
    return groupState.unread_count || groupState.unread_mentions_count;
  }

  getUnreadGroupIds = async (groups: Group[]) => {
    const ids = _.map(groups, 'id');
    const stateService: StateService = StateService.getInstance();
    const states = (await stateService.getAllGroupStatesFromLocal(ids)) || [];
    return states.filter(this.hasUnread).map(state => state.id);
  }

  /**
   * extract out groups/teams which are latest than the oldest unread post
   * or just use default limit length
   */
  filterGroups = async (groups: Group[], limit: number) => {
    let sortedGroups = groups;
    const currentUserId = UserConfig.getCurrentUserId();
    sortedGroups = groups.filter((model: Group) => {
      if (model.is_team) {
        return true;
      }
      return (
        model.creator_id === currentUserId ||
        model.most_recent_post_created_at !== undefined
      );
    });
    sortedGroups = sortedGroups.sort(
      (group1: Group, group2: Group) =>
        this.getGroupTime(group2) - this.getGroupTime(group1),
    );

    // Find oldest unread group's time
    const unreadGroupIds = await this.getUnreadGroupIds(sortedGroups);
    const oldestUnreadGroupTime = sortedGroups
      .filter(group => unreadGroupIds.includes(group.id))
      .map(this.getGroupTime)
      .sort()
      .shift();

    if (oldestUnreadGroupTime) {
      // With unread message
      const filteredGroups = sortedGroups.filter(
        (group: Group, i) => this.getGroupTime(group) >= oldestUnreadGroupTime,
      );
      if (filteredGroups.length > limit) {
        const result = [];
        for (let i = 0; i < limit; i++) {
          result.push(filteredGroups[i]);
        }
        for (let i = limit; i < filteredGroups.length; i++) {
          if (unreadGroupIds.indexOf(filteredGroups[i].id) !== -1) {
            result.push(filteredGroups[i]);
          }
        }
        return result;
      }
    }

    // Without unread message
    if (sortedGroups.length > limit) {
      sortedGroups.length = limit;
    }

    return sortedGroups;
  }

  handlePartialData = async (groups: Partial<Raw<Group>>[]) => {
    if (groups.length === 0) {
      return;
    }
    const transformData = await this.getExistedAndTransformDataFromPartial(
      groups,
    );
    await this.doNotification([], transformData);
  }
}

export { GroupHandleDataController };
