/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import { daoManager, DeactivatedDao } from '../../dao';
import { GroupDao } from '../../module/group/dao';
import GroupAPI from '../../api/glip/group';
import notificationCenter, {
  NotificationEntityUpdatePayload,
} from '../notificationCenter';
import { ENTITY, SERVICE } from '../../service/eventKey';
import ProfileService from '../../service/profile';
import { extractHiddenGroupIds } from '../profile/handleData';
import _ from 'lodash';
import { transform } from '../utils';
import { PartialWithKey, GroupState } from '../../models';

import { Raw } from '../../framework/model';
import { Group } from '../../module/group/entity';
import { Post } from '../../module/post/entity';
import { Profile } from '../../module/profile/entity';

import { StateService } from '../../module/state';
import { EVENT_TYPES } from '../constants';
import { UserConfig } from '../account/UserConfig';

async function getExistedAndTransformDataFromPartial(
  groups: Partial<Raw<Group>>[],
): Promise<Group[]> {
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
            Ok: data => handleData([data]),
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

async function calculateDeltaData(
  deltaGroup: Raw<Group>,
): Promise<Group | void> {
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

async function getTransformData(groups: Raw<Group>[]): Promise<Group[]> {
  const transformedData: (Group | null)[] = await Promise.all(
    groups.map(async (item: Raw<Group>) => {
      let finalItem = item;
      /* eslint-disable no-underscore-dangle */
      if (finalItem._delta && item._id) {
        const calculated = await calculateDeltaData(item);
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
      return transformed;
    }),
  );

  return transformedData.filter(
    (item: Group | null) => item !== null,
  ) as Group[];
}

async function doNotification(deactivatedData: Group[], groups: Group[]) {
  groups.length && notificationCenter.emit(SERVICE.GROUP_CURSOR, groups);
  const deactivatedGroupIds = _.map(deactivatedData, (group: Group) => {
    return group.id;
  });
  deactivatedGroupIds.length &&
    notificationCenter.emitEntityDelete(ENTITY.GROUP, deactivatedGroupIds);
  groups.length && notificationCenter.emitEntityUpdate(ENTITY.GROUP, groups);
}

async function operateGroupDao(deactivatedData: Group[], normalData: Group[]) {
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

async function saveDataAndDoNotification(groups: Group[]) {
  const deactivatedData = groups.filter(
    (item: Group) => item && item.deactivated,
  );
  const normalData = groups.filter((item: Group) => item && !item.deactivated);
  await operateGroupDao(deactivatedData, normalData);
  await doNotification(deactivatedData, normalData);
  return normalData;
}

export default async function handleData(groups: Raw<Group>[]) {
  if (groups.length === 0) {
    return;
  }

  const logLabel = `[Performance]grouphandleData ${Date.now()}`;
  console.time(logLabel);
  const transformData = await getTransformData(groups);
  const data = transformData.filter(item => item);

  // handle deactivated data and normal data
  await saveDataAndDoNotification(data);
  // check all group members exist in local or not if not, should get from remote
  // seems we only need check normal groups, don't need to check deactivated data
  // if (shouldCheckIncompleteMembers) {
  //   await checkIncompleteGroupsMembers(normalGroups);
  // }
  console.timeEnd(logLabel);
}

async function doFavoriteGroupsNotification(favIds: number[]) {
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
    groups = sortFavoriteGroups(validFavIds, groups);

    _.forEach(groups, (group: Group) => {
      replaceGroups.set(group.id, group);
    });
  }
  notificationCenter.emitEntityReplace(ENTITY.FAVORITE_GROUPS, replaceGroups);
}

function sortFavoriteGroups(ids: number[], groups: Group[]): Group[] {
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

async function handleFavoriteGroupsChanged(
  oldProfile: Profile,
  newProfile: Profile,
) {
  mainLogger.debug('---------handleFavoriteGroupsChanged---------');
  if (oldProfile && newProfile) {
    const oldIds = oldProfile.favorite_group_ids || [];
    const newIds = newProfile.favorite_group_ids || [];
    if (oldIds.toString() !== newIds.toString()) {
      const moreFavorites: number[] = _.difference(newIds, oldIds);
      const moreNormals: number[] = _.difference(oldIds, newIds);
      const dao = daoManager.getDao(GroupDao);
      if (moreFavorites.length) {
        const resultGroups: Group[] = await dao.queryGroupsByIds(moreFavorites);
        doNonFavoriteGroupsNotification(resultGroups, false);
      }
      if (moreNormals.length) {
        const resultGroups = await dao.queryGroupsByIds(moreNormals);
        doNonFavoriteGroupsNotification(resultGroups, true);
      }
      await doFavoriteGroupsNotification(newProfile.favorite_group_ids || []);
    }
  }
}

async function handleHiddenGroupsChanged(
  localHiddenGroupIds: number[],
  remoteHiddenGroupIds: number[],
) {
  const moreHiddenIds: number[] = _.difference(
    remoteHiddenGroupIds,
    localHiddenGroupIds,
  );
  const moreOpenIds: number[] = _.difference(
    localHiddenGroupIds,
    remoteHiddenGroupIds,
  );
  const dao = daoManager.getDao(GroupDao);
  if (moreHiddenIds.length) {
    const groups = await dao.queryGroupsByIds(moreHiddenIds);
    doNotification(groups, []);
  }
  if (moreOpenIds.length) {
    const groups = await dao.queryGroupsByIds(moreOpenIds);
    doNotification([], groups);
  }
}

function doNonFavoriteGroupsNotification(groups: Group[], isPut: boolean) {
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
    teamIds && notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teamIds);

    const peopleGroups = groups.filter((item: Group) => !item.is_team);
    const peopleGroupIds = _.map(peopleGroups, (group: Group) => {
      return group.id;
    });
    peopleGroupIds &&
      notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, peopleGroupIds);
  }
}

function isNeedToUpdateMostRecent4Group(post: Post, group: Group): boolean {
  return (
    !group.most_recent_post_created_at ||
    group.most_recent_post_created_at < post.created_at
  );
}

function getUniqMostRecentPostsByGroup(posts: Post[]): Post[] {
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

async function handleGroupMostRecentPostChanged({
  type,
  body,
}: NotificationEntityUpdatePayload<Post>) {
  if (type !== EVENT_TYPES.UPDATE || !body.entities) {
    return;
  }
  const posts: Post[] = [];
  body.entities.forEach((item: Post) => posts.push(item));
  const uniqMaxPosts = getUniqMostRecentPostsByGroup(posts);
  const groupDao = daoManager.getDao(GroupDao);
  let validGroups: Partial<Raw<Group>>[] = [];
  const ids: number[] = [];
  await groupDao.doInTransaction(async () => {
    const groups: (null | Partial<Raw<Group>>)[] = await Promise.all(
      uniqMaxPosts.map(async (post: Post) => {
        const group: null | Group = await groupDao.get(post.group_id);
        if (group && isNeedToUpdateMostRecent4Group(post, group)) {
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
    validGroups = groups.filter(item => item !== null) as Partial<Raw<Group>>[];
  });
  await handlePartialData(validGroups);
  ids.length &&
    notificationCenter.emit(SERVICE.POST_SERVICE.NEW_POST_TO_GROUP, ids);
}

function getGroupTime(group: Group) {
  return group.most_recent_post_created_at || group.created_at;
}

function hasUnread(groupState: GroupState) {
  return groupState.unread_count || groupState.unread_mentions_count;
}

async function getUnreadGroupIds(groups: Group[]) {
  const ids = _.map(groups, 'id');
  const stateService: StateService = StateService.getInstance();
  const states = (await stateService.getAllGroupStatesFromLocal(ids)) || [];
  return states.filter(hasUnread).map(state => state.id);
}

/**
 * extract out groups/teams which are latest than the oldest unread post
 * or just use default limit length
 */
async function filterGroups(groups: Group[], limit: number) {
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
      getGroupTime(group2) - getGroupTime(group1),
  );

  // Find oldest unread group's time
  const unreadGroupIds = await getUnreadGroupIds(sortedGroups);
  const oldestUnreadGroupTime = sortedGroups
    .filter(group => unreadGroupIds.includes(group.id))
    .map(getGroupTime)
    .sort()
    .shift();

  if (oldestUnreadGroupTime) {
    // With unread message
    const filteredGroups = sortedGroups.filter(
      (group: Group, i) => getGroupTime(group) >= oldestUnreadGroupTime,
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

async function handlePartialData(groups: Partial<Raw<Group>>[]) {
  if (groups.length === 0) {
    return;
  }
  const transformData = await getExistedAndTransformDataFromPartial(groups);
  await doNotification([], transformData);
}

export {
  handleFavoriteGroupsChanged,
  handleGroupMostRecentPostChanged,
  handleHiddenGroupsChanged,
  saveDataAndDoNotification,
  filterGroups,
  sortFavoriteGroups,
  handlePartialData,
  isNeedToUpdateMostRecent4Group,
  getUniqMostRecentPostsByGroup,
  calculateDeltaData,
};
