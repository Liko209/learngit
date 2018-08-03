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
import { ENTITY } from '../../service/eventKey';
import PersonService from '../../service/person';
import ProfileService from '../../service/profile';
import _ from 'lodash';
import { transform } from '../utils';
import { Group, Post, Raw, Profile } from '../../models';
import { mainLogger } from 'foundation';
import { GROUP_QUERY_TYPE } from '../constants';
import StateService from '../state';

async function checkIncompleteGroupsMembers(groups: Group[]) {
  if (groups.length) {
    try {
      return await Promise.all(
        groups.map(async (group: Group) => {
          if (group.members) {
            const personService: PersonService = PersonService.getInstance();
            return personService.getPersonsByIds(group.members);
          }
          return group;
        })
      );
    } catch (e) {
      mainLogger.warn(`checkIncompleteGroupsMembers error: ${e}`);
    }
  }
  return [];
}

async function getTransformData(groups: Raw<Group>[]): Promise<Group[]> {
  const transformedData: (Group | null)[] = await Promise.all(
    groups.map(async (item: Raw<Group>) => {
      let finalItem = item;
      /* eslint-disable no-underscore-dangle */
      if (finalItem._delta && item._id) {
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
    })
  );

  return transformedData.filter((item: Group | null) => item !== null) as Group[];
}

async function doNotification(deactivatedData: Group[], normalData: Group[]) {
  const profileService: ProfileService = ProfileService.getInstance();
  const profile = await profileService.getProfile();
  const favIds = (profile && profile.favorite_group_ids) || [];

  /**
   * favorite groups/teams: put/delete
   * normal groups: put/delete
   * normal teams: put/delte
   */

  const archivedTeams = normalData.filter((item: Group) => item.is_archived);

  let deactivatedTeams = deactivatedData.filter((item: Group) => item.is_team && favIds.indexOf(item.id) === -1);
  deactivatedTeams = deactivatedTeams.concat(archivedTeams.filter((item: Group) => favIds.indexOf(item.id) !== -1));

  let deactivatedFavGroups = deactivatedData.filter((item: Group) => favIds.indexOf(item.id) !== -1);
  deactivatedFavGroups = deactivatedFavGroups.concat(
    archivedTeams.filter((item: Group) => favIds.indexOf(item.id) !== -1)
  );

  const deactivatedGroups = deactivatedData.filter((item: Group) => !item.is_team && favIds.indexOf(item.id) === -1);

  deactivatedFavGroups.length > 0 && notificationCenter.emitEntityDelete(ENTITY.FAVORITE_GROUPS, deactivatedFavGroups);
  deactivatedTeams.length > 0 && notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, deactivatedTeams);
  deactivatedGroups.length > 0 && notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, deactivatedGroups);

  let addedTeams = normalData.filter((item: Group) => item.is_team && favIds.indexOf(item.id) === -1);
  addedTeams = await filterGroups(addedTeams, GROUP_QUERY_TYPE.TEAM, 20);

  let addedGroups = normalData.filter((item: Group) => !item.is_team && favIds.indexOf(item.id) === -1);
  addedGroups = await filterGroups(addedGroups, GROUP_QUERY_TYPE.GROUP, 10);

  const addFavorites = normalData.filter((item: Group) => favIds.indexOf(item.id) !== -1);
  addedTeams.length > 0 && notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, addedTeams);
  addedGroups.length > 0 && notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, addedGroups);
  addFavorites.length > 0 && notificationCenter.emitEntityPut(ENTITY.FAVORITE_GROUPS, addFavorites);
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
  const data = transformData.filter(item => item !== null && item.members && item.members.indexOf(userId) !== -1);
  // handle deactivated data and normal data
  // const normalGroups =
  // const normalGroups = await baseHandleData({
  //   data,
  //   eventKey: ENTITY.GROUP,
  //   dao,
  // });
  // handle deactivated data and normal data
  const normalGroups = await saveDataAndDoNotification(data);
  // check all group members exist in local or not if not, should get from remote
  // seems we only need check normal groups, don't need to check deactivated data
  await checkIncompleteGroupsMembers(normalGroups);
}

async function handleFavoriteGroupsChanged(oldProfile: Profile, newProfile: Profile) {
  if (oldProfile && newProfile) {
    const oldIds = oldProfile.favorite_group_ids || [];
    const newIds = newProfile.favorite_group_ids || [];
    if (oldIds.sort().toString() !== newIds.sort().toString()) {
      const moreFavorites: number[] = _.difference(newIds, oldIds);
      const moreNormals: number[] = _.difference(oldIds, newIds);
      const dao = daoManager.getDao(GroupDao);
      if (moreFavorites.length) {
        const resultGroups: Group[] = await dao.queryGroupsByIds(moreFavorites);
        notificationCenter.emitEntityPut(ENTITY.FAVORITE_GROUPS, resultGroups);
        const teams = resultGroups.filter((item: Group) => item.is_team);
        notificationCenter.emitEntityDelete(ENTITY.TEAM_GROUPS, teams);
        const groups = resultGroups.filter((item: Group) => !item.is_team);
        notificationCenter.emitEntityDelete(ENTITY.PEOPLE_GROUPS, groups);
      }
      if (moreNormals.length) {
        const resultGroups = await dao.queryGroupsByIds(moreNormals);
        notificationCenter.emitEntityDelete(ENTITY.FAVORITE_GROUPS, resultGroups);
        const teams = resultGroups.filter((item: Group) => item.is_team);
        // notificationCenter.emitEntityPut(ENTITY.FAVORITE_GROUPS, teams);

        const groups = resultGroups.filter((item: Group) => !item.is_team);
        notificationCenter.emitEntityPut(ENTITY.TEAM_GROUPS, teams);

        notificationCenter.emitEntityPut(ENTITY.PEOPLE_GROUPS, groups);
      }
    }
  }
}

async function handleGroupMostRecentPostChanged(posts: Post[]) {
  const groupDao = daoManager.getDao(GroupDao);
  const groups: (null | Group)[] = await Promise.all(
    posts.map(async post => {
      const group: null | Group = await groupDao.get(post.group_id);
      if (group) {
        group.most_recent_content_modified_at = post.modified_at;
        group.most_recent_post_created_at = post.created_at;
        group.most_recent_post_id = post.id;
        return group;
      }
      return null;
    })
  );
  await saveDataAndDoNotification(groups.filter(item => item !== null) as Group[]);
}

/**
 * extract out groups/teams which are latest than the oldest unread post
 * or just use default limit length
 */

async function filterGroups(groups: Group[], groupType = GROUP_QUERY_TYPE.TEAM, defaultLength: number) {
  if (groups.length <= defaultLength) {
    return groups;
  }
  const stateService: StateService = StateService.getInstance();
  let states = await stateService.getAllGroupStatesFromLocal();
  let result = groups;
  const statesIds = states
    ? states.filter(item => item.unread_count || item.unread_mentions_count).map(item => item.id)
    : [];
  if (statesIds.length > 0) {
    const times =
      result
        .filter(item => statesIds.includes(item.id))
        .map((item: Group) => item.most_recent_post_created_at || Infinity)
        .sort() || [];
    if (times.length > 0) {
      const time = times[0];
      if (time !== Infinity) {
        const tmpGroups = result.filter((item: Group) => {
          return item.most_recent_post_created_at && item.most_recent_post_created_at >= time;
        });
        if (tmpGroups.length > defaultLength) {
          result = tmpGroups;
          return result;
        }
      }
    }
  }
  if (result.length > defaultLength) {
    result.length = defaultLength;
  }
  return result;
}

export { handleFavoriteGroupsChanged, handleGroupMostRecentPostChanged, saveDataAndDoNotification, filterGroups };
