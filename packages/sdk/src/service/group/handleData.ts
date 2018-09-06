/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager, DeactivatedDao } from '../../dao';
import GroupDao from '../../dao/group';
import GroupAPI from '../../api/glip/group';
import AccountDao from '../../dao/account';
import { ACCOUNT_USER_ID } from '../../dao/account/constants';
import notificationCenter from '../notificationCenter';
import { ENTITY, SERVICE } from '../../service/eventKey';
import ProfileService from '../../service/profile';
import _ from 'lodash';
import { transform } from '../utils';
import { Group, Post, Raw, Profile, PartialWithKey, GroupState } from '../../models';
import StateService from '../state';
import { mainLogger } from 'foundation';

async function getExistedAndTransformDataFromPartial(groups: Partial<Raw<Group>>[]): Promise<Group[]> {
  const groupDao = daoManager.getDao<GroupDao>(GroupDao);
  const transformedData: (Partial<Group> | null)[] = await Promise.all(
    groups.map(async (item: Partial<Raw<Group>>) => {
      if (item._id) {
        const finalItem = item;
        const existedGroup = await groupDao.get(item._id);
        if (existedGroup) {
          // If existed in DB, update directly and return the updated result for notification later
          /* eslint-enable no-underscore-dangle */
          const transformed: PartialWithKey<Group> = transform<PartialWithKey<Group>>(finalItem);
          await groupDao.update(transformed);
          if (transformed.id) {
            const updated = await groupDao.get(transformed.id);
            return updated;
          }
        } else {
          // If not existed in DB, request from API and handle the response again
          const resp = await GroupAPI.requestGroupById(item._id);
          if (resp && resp.data) {
            handleData([resp.data] as Raw<Group>[]);
          }
        }
      }
      return null;
    }),
  );

  return transformedData.filter((item: Group | null) => item !== null) as Group[];
}

async function calculateDeltaData(deltaGroup: Raw<Group>): Promise<Group | void> {
  const groupDao = daoManager.getDao<GroupDao>(GroupDao);

  const originData = await groupDao.get(deltaGroup._id);
  if (originData && deltaGroup._delta) {
    const { add, remove, set } = deltaGroup._delta;
    const result = originData;
    if (remove) {
      for (const key in remove) {
        if (remove.hasOwnProperty(key) && originData.hasOwnProperty(key)) {
          result[key] = _.drop(originData[key], remove[key]);
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
          result[key] = _.concat([], originData[key], add[key]);
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
        const resp = await GroupAPI.requestGroupById(item._id);
        if (resp && resp.data) {
          finalItem = resp.data;
        } else {
          return null;
        }
      }
      /* eslint-enable no-underscore-dangle */
      const transformed: Group = transform<Group>(finalItem);
      return transformed;
    }),
  );

  return transformedData.filter((item: Group | null) => item !== null) as Group[];
}

async function doNotification(deactivatedData: Group[], normalData: Group[]) {
  notificationCenter.emit(SERVICE.GROUP_CURSOR, normalData);

  const profileService: ProfileService = ProfileService.getInstance();
  const profile = await profileService.getProfile();
  const favIds = (profile && profile.favorite_group_ids) || [];

  /**
   * favorite groups/teams: put/delete
   * normal groups: put/delete
   * normal teams: put/delete
   */

  const archivedTeams = normalData.filter((item: Group) => item.is_archived);

  let deactivatedTeams = deactivatedData
    .filter((item: Group) => item.is_team && favIds.indexOf(item.id) === -1);
  deactivatedTeams = deactivatedTeams
    .concat(archivedTeams.filter((item: Group) => favIds.indexOf(item.id) !== -1));

  let deactivatedFavGroups = deactivatedData
    .filter((item: Group) => favIds.indexOf(item.id) !== -1);
  deactivatedFavGroups = deactivatedFavGroups.concat(
    archivedTeams.filter((item: Group) => favIds.indexOf(item.id) !== -1),
  );

  const deactivatedGroups = deactivatedData
    .filter((item: Group) => !item.is_team && favIds.indexOf(item.id) === -1);

  if (deactivatedFavGroups.length > 0) {
    notificationCenter.emitEntityDelete(ENTITY.FAVORITE_GROUPS, deactivatedFavGroups);
  }

  if (deactivatedTeams.length > 0) {
    notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, deactivatedTeams);
  }

  if (deactivatedGroups.length > 0) {
    notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, deactivatedGroups);
  }

  let addedTeams = normalData
    .filter((item: Group) => item.is_team && favIds.indexOf(item.id) === -1);
  addedTeams = await filterGroups(addedTeams, 20);

  let addedGroups = normalData
    .filter((item: Group) => !item.is_team && favIds.indexOf(item.id) === -1);
  addedGroups = await filterGroups(addedGroups, 10);

  const addFavorites = normalData.filter((item: Group) => favIds.indexOf(item.id) !== -1);
  addedTeams.length > 0 && notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, addedTeams);
  addedGroups.length > 0 && notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, addedGroups);
  addFavorites.length > 0 && await doFavoriteGroupsNotification(favIds);
}

async function operateGroupDao(deactivatedData: Group[], normalData: Group[]) {
  try {
    const dao = daoManager.getDao(GroupDao);
    if (deactivatedData.length) {
      daoManager.getDao(DeactivatedDao).bulkPut(deactivatedData);
      dao.bulkDelete(deactivatedData.map(item => item.id));
    }
    if (normalData.length) {
      await dao.bulkPut(normalData);
    }
  } catch (e) {
    console.error(`operateGroupDao error ${JSON.stringify(e)}`);
  }
}

async function saveDataAndDoNotification(groups: Group[]) {
  const deactivatedData = groups.filter((item: Group) => item && item.deactivated);
  const normalData = groups.filter((item: Group) => item && !item.deactivated);
  await operateGroupDao(deactivatedData, normalData);
  await doNotification(deactivatedData, normalData);
  return normalData;
}

export default async function handleData(groups: Raw<Group>[]) {
  if (groups.length === 0) {
    return;
  }
  // const dao = daoManager.getDao(GroupDao);
  const accountDao = daoManager.getKVDao(AccountDao);
  const userId = Number(accountDao.get(ACCOUNT_USER_ID));
  const transformData = await getTransformData(groups);

  const data = transformData
    .filter(item => item !== null && item.members && item.members.indexOf(userId) !== -1);

  // handle deactivated data and normal data
  await saveDataAndDoNotification(data);
  // check all group members exist in local or not if not, should get from remote
  // seems we only need check normal groups, don't need to check deactivated data
  // if (shouldCheckIncompleteMembers) {
  //   await checkIncompleteGroupsMembers(normalGroups);
  // }
}

async function doFavoriteGroupsNotification(favIds: number[]) {
  mainLogger.debug(`-------doFavoriteGroupsNotification--------`);
  if (favIds.length) {
    const dao = daoManager.getDao(GroupDao);
    let groups = await dao.queryGroupsByIds(favIds);
    groups = sortFavoriteGroups(favIds, groups);
    notificationCenter.emitEntityReplaceAll(ENTITY.FAVORITE_GROUPS, groups);
  } else {
    notificationCenter.emitEntityReplaceAll(ENTITY.FAVORITE_GROUPS, []);
  }
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

async function handleFavoriteGroupsChanged(oldProfile: Profile, newProfile: Profile) {
  mainLogger.debug(`---------handleFavoriteGroupsChanged---------`);
  if (oldProfile && newProfile) {
    const oldIds = oldProfile.favorite_group_ids || [];
    const newIds = newProfile.favorite_group_ids || [];
    if (oldIds.toString() !== newIds.toString()) {
      const moreFavorites: number[] = _.difference(newIds, oldIds);
      const moreNormals: number[] = _.difference(oldIds, newIds);
      const dao = daoManager.getDao(GroupDao);
      if (moreFavorites.length) {
        const resultGroups: Group[] = await dao.queryGroupsByIds(moreFavorites);
        const teams = resultGroups.filter((item: Group) => item.is_team);
        notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teams);
        const groups = resultGroups.filter((item: Group) => !item.is_team);
        notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, groups);
      }
      if (moreNormals.length) {
        const resultGroups = await dao.queryGroupsByIds(moreNormals);
        const teams = resultGroups.filter((item: Group) => item.is_team);
        notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, teams);
        const groups = resultGroups.filter((item: Group) => !item.is_team);
        notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, groups);
      }
      await doFavoriteGroupsNotification(newProfile.favorite_group_ids || []);
    }
  }
}

async function handleGroupMostRecentPostChanged(posts: Post[]) {
  const groupDao = daoManager.getDao(GroupDao);
  let validGroups: Group[] = [];
  await groupDao.doInTransaction(async () => {
    const groups: (null | Group)[] = await Promise.all(
      posts.map(async (post) => {
        const group: null | Group = await groupDao.get(post.group_id);
        if (group) {
          group.most_recent_content_modified_at = post.modified_at;
          group.most_recent_post_created_at = post.created_at;
          group.most_recent_post_id = post.id;
          return group;
        }
        return null;
      }),
    );
    validGroups = groups.filter(item => item !== null) as Group[];
  });

  await saveDataAndDoNotification(validGroups);
}

function getGroupTime(group: Group) {
  return group.most_recent_post_created_at || group.created_at;
}

function hasUnread(groupState: GroupState) {
  return groupState.unread_count || groupState.unread_mentions_count;
}

async function getUnreadGroupIds(groups: Group[]) {
  const stateService: StateService = StateService.getInstance();
  const states = await stateService.getAllGroupStatesFromLocal() || [];
  return states
    .filter(hasUnread)
    .map(state => state.id);
}

/**
 * extract out groups/teams which are latest than the oldest unread post
 * or just use default limit length
 */
async function filterGroups(
  groups: Group[],
  limit: number,
) {
  const sortedGroups = groups.sort((group1: Group, group2: Group) => getGroupTime(group2) - getGroupTime(group1));

  // Find oldest unread group's time
  const unreadGroupIds = await getUnreadGroupIds(sortedGroups);
  const oldestUnreadGroupTime = sortedGroups
    .filter(group => unreadGroupIds.includes(group.id))
    .map(getGroupTime)
    .sort()
    .shift();

  if (oldestUnreadGroupTime) {
    // With unread message
    return sortedGroups.filter((group: Group) => getGroupTime(group) >= oldestUnreadGroupTime);
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
  saveDataAndDoNotification,
  filterGroups,
  sortFavoriteGroups,
  handlePartialData,
};
