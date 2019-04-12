/*
 * @Author: Paynter Chen
 * @Date: 2019-02-02 16:16:51
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import _ from 'lodash';

import { Api } from '../../../api';
import GroupAPI from '../../../api/glip/group';
import { daoManager } from '../../../dao';
import {
  IEntityCacheSearchController,
  Terms,
} from '../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { SortableModel } from '../../../framework/model';
import { AccountUserConfig } from '../../../module/account/config';
import { CompanyService } from '../../../module/company';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { versionHash } from '../../../utils/mathUtils';
import {
  ProfileService,
  extractHiddenGroupIdsWithoutUnread,
} from '../../profile';
import { transform } from '../../../service/utils';
import {
  PERFORMANCE_KEYS,
  PerformanceTracerHolder,
  uniqueArray,
} from '../../../utils';
import TypeDictionary from '../../../utils/glip-type-dictionary/types';
import { compareName } from '../../../utils/helper';
import { isValidEmailAddress } from '../../../utils/regexUtils';
import { PersonService } from '../../person';
import { Person } from '../../person/entity';
import { GroupDao } from '../dao';
import { Group, TeamPermission } from '../entity';
import { IGroupService } from '../service/IGroupService';
import { GroupHandleDataController } from './GroupHandleDataController';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

function buildNewGroupInfo(members: number[]) {
  const userConfig = new AccountUserConfig();
  const userId = userConfig.getGlipUserId();
  return {
    members,
    creator_id: Number(userId),
    is_new: true,
    new_version: versionHash(),
  };
}

export class GroupFetchDataController {
  constructor(
    public groupService: IGroupService,
    public entitySourceController: IEntitySourceController<Group>,
    public partialModifyController: IPartialModifyController<Group>,
    public entityCacheSearchController: IEntityCacheSearchController<Group>,
    public groupHandleDataController: GroupHandleDataController,
  ) {}

  async getGroupsByType(
    groupType = GROUP_QUERY_TYPE.ALL,
    offset = 0,
    _limit?: number,
  ): Promise<Group[]> {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    const limit = _limit || (await profileService.getMaxLeftRailGroup());
    mainLogger.debug(`offset:${offset} limit:${limit} groupType:${groupType}`);
    let result: Group[] = [];
    const dao = daoManager.getDao(GroupDao);

    if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
      result = await this._getFavoriteGroups();
    } else if (groupType === GROUP_QUERY_TYPE.ALL) {
      if (this.entityCacheSearchController.isInitialized()) {
        result = await this.entityCacheSearchController.getEntities(
          (item: Group) => this.groupService.isValid(item),
        );
        result = this._getFromSortedByMostRectPost(result, offset, limit);
      } else {
        result = await dao.queryAllGroups(offset, limit);
      }
    } else {
      const profile = await profileService.getProfile();
      const favoriteGroupIds =
        profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
      const hiddenIds = profile
        ? await extractHiddenGroupIdsWithoutUnread(profile)
        : [];
      const excludeIds = favoriteGroupIds.concat(hiddenIds);
      const userConfig = new AccountUserConfig();
      const userId = userConfig.getGlipUserId();
      const isTeam = groupType === GROUP_QUERY_TYPE.TEAM;
      if (this.entityCacheSearchController.isInitialized()) {
        result = await this.entityCacheSearchController.getEntities(
          (item: Group) =>
            this.groupService.isValid(item) &&
            !excludeIds.includes(item.id) &&
            (userId ? item.members.includes(userId) : true) &&
            (isTeam ? item.is_team === isTeam : !item.is_team),
        );
        if (offset !== 0) {
          result = result.slice(offset + 1, result.length);
        }
      } else {
        result = await dao.queryGroups(
          offset,
          Infinity,
          isTeam,
          excludeIds,
          userId,
        );
      }
      result = await this.groupHandleDataController.filterGroups(result, limit);
    }
    return groupType === GROUP_QUERY_TYPE.FAVORITE
      ? result
      : result.slice(0, result.length > 50 ? 50 : result.length);
  }

  async getGroupsByIds(ids: number[], order?: boolean): Promise<Group[]> {
    if (ids.length) {
      const groups = await this.entitySourceController.batchGet(ids, order);
      return groups.filter((group) => group !== null) as Group[];
    }
    return [];
  }

  async getLocalGroup(personIds: number[]): Promise<Group | null> {
    try {
      const result = await this._queryGroupByMemberList(personIds);
      if (result) {
        return result;
      }
      return null;
    } catch (e) {
      mainLogger.error(`getLocalGroup error =>${e}`);
      return null;
    }
  }

  async getGroupByPersonId(personId: number): Promise<Group> {
    return await this.getOrCreateGroupByMemberList([personId]);
  }

  async getOrCreateGroupByMemberList(members: number[]): Promise<Group> {
    const result = await this._queryGroupByMemberList(members);
    if (result) {
      return result;
    }
    const group = await this.requestRemoteGroupByMemberList(members);
    await this.entitySourceController.put(group);
    return group;
  }

  async requestRemoteGroupByMemberList(members: number[]): Promise<Group> {
    const memberIds = this._addCurrentUserToMemList(members);
    const info: Partial<Group> = buildNewGroupInfo(memberIds);
    const result = await GroupAPI.requestNewGroup(info);
    return transform<Group>(result);
  }

  async getLeftRailGroups(): Promise<Group[]> {
    let result: Group[] = [];
    let groups = await this.getGroupsByType(GROUP_QUERY_TYPE.FAVORITE);
    result = result.concat(groups);

    groups = await this.getGroupsByType(GROUP_QUERY_TYPE.GROUP);
    result = result.concat(groups);

    groups = await this.getGroupsByType(GROUP_QUERY_TYPE.TEAM);
    result = result.concat(groups);
    return result;
  }

  async isFavored(id: number, type: number): Promise<boolean> {
    let groupId: number | undefined = undefined;
    switch (type) {
      case TypeDictionary.TYPE_ID_PERSON: {
        const group = await this.getLocalGroup([id]);
        if (group) {
          groupId = group.id;
        }
        break;
      }
      case TypeDictionary.TYPE_ID_GROUP:
      case TypeDictionary.TYPE_ID_TEAM: {
        groupId = id;
        break;
      }
      default: {
        mainLogger.error('isFavored : should not run to here');
      }
    }

    if (groupId) {
      return await this._isGroupFavored(groupId);
    }

    return false;
  }
  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_GROUP,
      logId,
    );
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    if (!currentUserId) {
      return null;
    }
    const sortFunc = (
      group: Group,
      terms: Terms,
    ): SortableModel<Group> | null => {
      if (this._isValidGroup(group) && group.members.length > 2) {
        const groupName = this.getGroupNameByMultiMembers(
          group.members,
          currentUserId,
        );
        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        const lowerCaseGroupName = groupName.toLowerCase();
        const isFuzzyMatched =
          this.entityCacheSearchController.isFuzzyMatched(
            lowerCaseGroupName,
            searchKeyTerms,
          ) ||
          this.entityCacheSearchController.isSoundexMatched(
            lowerCaseGroupName,
            searchKeyTermsToSoundex,
          );
        if (
          (searchKeyTerms.length > 0 && isFuzzyMatched) ||
          (fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0)
        ) {
          return {
            id: group.id,
            displayName: groupName,
            firstSortKey: lowerCaseGroupName,
            entity: group,
          };
        }
      }
      return null;
    };

    const result = await this.entityCacheSearchController.searchEntities(
      sortFunc,
      searchKey,
      undefined,
      (groupA: SortableModel<Group>, groupB: SortableModel<Group>) => {
        if (groupA.firstSortKey < groupB.firstSortKey) {
          return -1;
        }
        if (groupA.firstSortKey > groupB.firstSortKey) {
          return 1;
        }
        return 0;
      },
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null> {
    const logId = Date.now();
    PerformanceTracerHolder.getPerformanceTracer().start(
      PERFORMANCE_KEYS.SEARCH_TEAM,
      logId,
    );
    const userConfig = new AccountUserConfig();
    const currentUserId = userConfig.getGlipUserId();
    if (!currentUserId) {
      return null;
    }

    const kSortingRateWithFirstMatched: number = 1;
    const kSortingRateWithFirstAndPositionMatched: number = 1.1;

    const result = await this.entityCacheSearchController.searchEntities(
      (team: Group, terms: Terms) => {
        let isMatched: boolean = false;
        let sortValue: number = 0;
        do {
          const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
          if (!this._idValidTeam(team)) {
            break;
          }

          if (fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0) {
            isMatched = this._isPublicTeamOrIncludeUser(team, currentUserId);
          }

          if (isMatched || searchKeyTerms.length === 0) {
            break;
          }
          const lowerCaseAbbreviation = team.set_abbreviation.toLowerCase();

          const isFuzzyMatched =
            this.entityCacheSearchController.isFuzzyMatched(
              lowerCaseAbbreviation,
              searchKeyTerms,
            ) ||
            this.entityCacheSearchController.isSoundexMatched(
              lowerCaseAbbreviation,
              searchKeyTermsToSoundex,
            );
          if (!isFuzzyMatched) {
            break;
          }

          if (!this._isPublicTeamOrIncludeUser(team, currentUserId)) {
            break;
          }

          const splitNames = this.entityCacheSearchController.getTermsFromSearchKey(
            lowerCaseAbbreviation,
          );

          for (let i = 0; i < splitNames.length; ++i) {
            for (let j = 0; j < searchKeyTerms.length; ++j) {
              if (
                this.entityCacheSearchController.isStartWithMatched(
                  splitNames[i].toLowerCase(),
                  [searchKeyTerms[j]],
                )
              ) {
                sortValue +=
                  i === j
                    ? kSortingRateWithFirstAndPositionMatched
                    : kSortingRateWithFirstMatched;
              }
            }
          }

          isMatched = true;
        } while (false);

        return isMatched
          ? {
            id: team.id,
            displayName: team.set_abbreviation,
            firstSortKey: sortValue,
            secondSortKey: team.set_abbreviation.toLowerCase(),
            entity: team,
          }
          : null;
      },
      searchKey,
      undefined,
      (groupA: SortableModel<Group>, groupB: SortableModel<Group>) => {
        if (groupA.firstSortKey > groupB.firstSortKey) {
          return -1;
        }
        if (groupA.firstSortKey < groupB.firstSortKey) {
          return 1;
        }

        if (groupA.secondSortKey < groupB.secondSortKey) {
          return -1;
        }
        if (groupA.secondSortKey > groupB.secondSortKey) {
          return 1;
        }
        return 0;
      },
    );
    PerformanceTracerHolder.getPerformanceTracer().end(logId);
    return result;
  }

  getGroupNameByMultiMembers(members: number[], currentUserId: number) {
    const names: string[] = [];
    const emails: string[] = [];
    const allPersons: Person[] = [];
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const diffMembers = _.difference(members, [currentUserId]);
    diffMembers.forEach((id: number) => {
      const person = personService.getSynchronously(id);
      if (person) {
        allPersons.push(person);
      }
    });

    allPersons.forEach((person: Person) => {
      if (person) {
        const name = personService.getName(person);
        if (name.length > 0) {
          names.push(name);
        } else {
          emails.push(person.email);
        }
      }
    });

    return names
      .sort(compareName)
      .concat(emails.sort(compareName))
      .join(', ');
  }

  isTeamAdmin(personId: number, permission?: TeamPermission) {
    if (permission) {
      // for some old team, thy don't have permission, so all member are admin
      const adminUserIds = this._getTeamAdmins(permission);
      return adminUserIds.some((x: number) => x === personId);
    }
    return true;
  }

  async getGroupEmail(groupId: number): Promise<string> {
    const group = await this.entitySourceController.get(groupId);
    let email = '';
    if (group) {
      const companyService = ServiceLoader.getInstance<CompanyService>(
        ServiceConfig.COMPANY_SERVICE,
      );
      const companyReplyDomain = await companyService.getCompanyEmailDomain(
        group.company_id,
      );

      if (companyReplyDomain) {
        const envDomain = this._getENVDomain();
        if (group.email_friendly_abbreviation) {
          email = `${
            group.email_friendly_abbreviation
          }@${companyReplyDomain}.${envDomain}`;
        }

        if (!isValidEmailAddress(email)) {
          email = `${group.id}@${companyReplyDomain}.${envDomain}`;
        }
      }
    }
    return email;
  }

  private async _isGroupFavored(groupId: number): Promise<boolean> {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    const profile = await profileService.getProfile();
    const favoriteGroupIds =
      profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
    return favoriteGroupIds.some((x: number) => groupId === x);
  }

  private _isPublicTeamOrIncludeUser(team: Group, userId: number) {
    return team.privacy === 'protected' || team.members.includes(userId);
  }

  private async _queryGroupByMemberList(ids: number[]): Promise<Group | null> {
    const memberIds = this._addCurrentUserToMemList(ids);
    const groupDao = daoManager.getDao(GroupDao);
    if (this.entityCacheSearchController.isInitialized()) {
      const result = await this.entityCacheSearchController.getEntities(
        (item: Group) =>
          this.groupService.isValid(item) &&
          !item.is_team &&
          item.members &&
          item.members.sort().toString() === memberIds.sort().toString(),
      );
      return result[0];
    }
    return await groupDao.queryGroupByMemberList(memberIds);
  }

  private _addCurrentUserToMemList(ids: number[]) {
    const userConfig = new AccountUserConfig();
    const userId = userConfig.getGlipUserId();
    if (userId) {
      ids.push(userId);
    }
    return uniqueArray(ids);
  }

  private _getENVDomain() {
    let apiServer = Api.httpConfig['glip'].server;
    if (apiServer) {
      let index = apiServer.indexOf('://');
      if (index > -1) {
        apiServer = apiServer.substr(index + 3);
      }

      index = apiServer.lastIndexOf(':');
      if (index > -1) {
        apiServer = apiServer.substring(0, index);
      }

      index = apiServer.indexOf('.');
      if (index !== -1 && apiServer.substr(0, index) === 'app') {
        apiServer = apiServer.substr(index + 1);
      }
    }
    return apiServer;
  }

  private _isValidGroup(group: Group) {
    return this.groupService.isValid(group) && !group.is_team;
  }

  private _idValidTeam(group: Group) {
    return this.groupService.isValid(group) && group.is_team;
  }

  private _getTeamAdmins(permission?: TeamPermission) {
    return permission && permission.admin ? permission.admin.uids : [];
  }

  private async _getFavoriteGroups(): Promise<Group[]> {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    const profile = await profileService.getProfile();
    if (
      profile &&
      profile.favorite_group_ids &&
      profile.favorite_group_ids.length > 0
    ) {
      let favoriteGroupIds = profile.favorite_group_ids.filter(
        (id: any) => typeof id === 'number' && !isNaN(id),
      );
      const hiddenIds = await extractHiddenGroupIdsWithoutUnread(profile);
      favoriteGroupIds = _.difference(favoriteGroupIds, hiddenIds);
      const groups = await this.groupService.getGroupsByIds(
        favoriteGroupIds,
        true,
      );
      return groups.filter((item: Group) => this.groupService.isValid(item));
    }
    return [];
  }

  private _getFromSortedByMostRectPost(
    groups: Group[],
    offset: number,
    limit: number,
  ) {
    return _.orderBy(groups, ['most_recent_post_created_at'], ['desc']).slice(
      offset,
      limit === Infinity ? groups.length : limit,
    );
  }
}
