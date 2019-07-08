/*
 * @Author: Paynter Chen
 * @Date: 2019-02-02 16:16:51
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger, PerformanceTracer } from 'foundation';
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
import { AccountService } from '../../account/service';
import { SortableModel, ModelIdType } from '../../../framework/model';
import { CompanyService } from '../../company';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { versionHash } from '../../../utils/mathUtils';
import {
  ProfileService,
  extractHiddenGroupIdsWithoutUnread,
} from '../../profile';
import { transform } from '../../../service/utils';
import { uniqueArray, GlipTypeUtil } from '../../../utils';
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
import { GroupConfigService } from '../../groupConfig';
import { SearchService } from '../../search';
import { RecentSearchTypes, RecentSearchModel } from '../../search/entity';
import { LAST_ACCESS_VALID_PERIOD } from '../../search/constants';
import { GROUP_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { PermissionService, UserPermissionType } from 'sdk/module/permission';
import { SortUtils } from 'sdk/framework/utils';

/* eslint-disable */
const LOG_TAG = '[GroupFetchDataController]';
const kTeamIncludeMe: number = 1;
const kSortingRateWithFirstMatched: number = 1;
const kSortingRateWithFirstAndPositionMatched: number = 1.1;
const MAX_LEFT_RAIL_GROUP: number = 80;

function buildNewGroupInfo(members: number[]) {
  const userConfig = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  ).userConfig;
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
    limit: number,
  ): Promise<Group[]> {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    mainLogger.debug(`offset:${offset} limit:${limit} groupType:${groupType}`);
    let result: Group[] = [];
    if (groupType === GROUP_QUERY_TYPE.FAVORITE) {
      result = await this._getFavoriteGroups();
    } else if (groupType === GROUP_QUERY_TYPE.ALL) {
      result = await this.entitySourceController.getEntities((item: Group) =>
        this.groupService.isValid(item),
      );
      result = this._getFromSortedByMostRectPost(result, offset, limit);
    } else {
      const profile = await profileService.getProfile();
      const favoriteGroupIds =
        profile && profile.favorite_group_ids ? profile.favorite_group_ids : [];
      const hiddenIds = profile
        ? await extractHiddenGroupIdsWithoutUnread(profile)
        : [];
      const excludeIds = favoriteGroupIds.concat(hiddenIds);
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      const userId = userConfig.getGlipUserId();
      const isTeam = groupType === GROUP_QUERY_TYPE.TEAM;
      result = await this.entitySourceController.getEntities(
        (item: Group) =>
          this.groupService.isValid(item) &&
          !excludeIds.includes(item.id) &&
          (userId ? item.members.includes(userId) : true) &&
          (isTeam ? item.is_team === isTeam : !item.is_team),
      );
      if (offset !== 0) {
        result = result.slice(offset + 1, result.length);
      }
      result = await this.groupHandleDataController.filterGroups(result, limit);
    }
    let count = result.length;
    mainLogger
      .tags(LOG_TAG)
      .info('getGroupsByType() result origin count:', count);
    if (count > MAX_LEFT_RAIL_GROUP) {
      const permissionService = ServiceLoader.getInstance<PermissionService>(
        ServiceConfig.PERMISSION_SERVICE,
      );
      const canShowAll = await permissionService.hasPermission(
        UserPermissionType.CAN_SHOW_ALL_GROUP,
      );
      count = canShowAll ? count : MAX_LEFT_RAIL_GROUP;
    }
    return groupType === GROUP_QUERY_TYPE.FAVORITE
      ? result
      : result.slice(0, count);
  }

  async getGroupsByIds(ids: number[], order?: boolean): Promise<Group[]> {
    if (ids.length) {
      const groups = await this.entitySourceController.batchGet(ids, order);
      return groups.filter((group: Group) => group !== null) as Group[];
    }
    return [];
  }

  async getPersonIdsBySelectedItem(
    ids: (number | string)[],
  ): Promise<(number | string)[]> {
    if (ids.length) {
      let personIds = ids.filter(
        (id: string | number) =>
          _.isString(id) ||
          GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_PERSON),
      );
      const groupIds = _.difference(ids, personIds) as number[];
      if (groupIds.length) {
        const groups = await this.getGroupsByIds(groupIds);
        groups.forEach(group => {
          if (group.members && group.members.length) {
            personIds = [...personIds, ...group.members];
          }
        });
      }
      return Array.from(new Set(personIds));
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

  async isFavored(id: number, type: number): Promise<boolean> {
    let groupId: number | undefined;
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

  async doFuzzySearchAllGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
    myGroupsOnly?: boolean,
    recentFirst?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }> {
    const performanceTracer = PerformanceTracer.start();

    const result = await this.entityCacheSearchController.searchEntities(
      await this._getTransformAllGroupFunc(
        fetchAllIfSearchKeyEmpty,
        myGroupsOnly,
        recentFirst,
      ),
      undefined,
      searchKey,
      undefined,
      this._sortGroupFunc,
    );
    performanceTracer.end({ key: GROUP_PERFORMANCE_KEYS.SEARCH_ALL_GROUP });
    return {
      terms: result.terms.searchKeyTerms,
      sortableModels: result.sortableModels,
    };
  }

  private get _currentUserId() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getGlipUserId();
  }

  private _getMostRecentViewTime(
    groupId: number,
    groupConfigService: GroupConfigService,
    recentSearchedGroups: Map<ModelIdType, RecentSearchModel>,
  ) {
    const now = Date.now();
    const record = recentSearchedGroups!.get(groupId);
    const config = groupConfigService.getSynchronously(groupId);
    const lastSearchTime = (record && record.time_stamp) || 0;
    const lastPostTime = (config && config.my_last_post_time) || 0;

    const maxAccessTime = Math.max(lastPostTime, lastSearchTime);
    return now - maxAccessTime > LAST_ACCESS_VALID_PERIOD ? 0 : maxAccessTime;
  }

  private get _groupConfigService() {
    return ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
  }

  private async _getTransformGroupFunc(
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ) {
    const groupConfigService = this._groupConfigService;
    const recentSearchedGroups = recentFirst
      ? await this._getRecentSearchGroups([RecentSearchTypes.GROUP])
      : undefined;

    return (group: Group, terms: Terms) => {
      do {
        if (!this._isValidGroup(group) || group.members.length <= 2) {
          break;
        }

        const persons = this.getAllPersonOfGroup(
          group.members,
          this._currentUserId,
        );

        if (persons.invisiblePersons.length) {
          break;
        }

        const { groupName, memberNames } = this.getGroupNameByMultiMembers(
          persons.visiblePersons,
        );
        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        const lowerCaseGroupName = groupName.toLowerCase();
        const isFuzzyMatched =
          this.entityCacheSearchController.isFuzzyMatched(
            lowerCaseGroupName,
            searchKeyTerms,
          ) ||
          (searchKeyTermsToSoundex.length &&
            this.entityCacheSearchController.isSoundexMatched(
              this.getSoundexValueOfGroup(persons.visiblePersons),
              searchKeyTermsToSoundex,
            ));

        const isMatched =
          (searchKeyTerms.length > 0 && isFuzzyMatched) ||
          (fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0);
        if (!isMatched) {
          break;
        }

        const keyWeight = this._getSplitKeyWeight(
          memberNames.map(x => x.toLowerCase()),
          searchKeyTerms,
        );
        const mostRecentViewTime = recentFirst
          ? this._getMostRecentViewTime(
              group.id,
              groupConfigService,
              recentSearchedGroups!,
            )
          : 0;
        return {
          id: group.id,
          lowerCaseName: lowerCaseGroupName,
          displayName: groupName,
          sortWeights: [keyWeight, mostRecentViewTime, -group.members.length],
          entity: group,
        };
      } while (false);

      return null;
    };
  }

  async doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }> {
    const performanceTracer = PerformanceTracer.start();

    const result = await this.entityCacheSearchController.searchEntities(
      await this._getTransformGroupFunc(fetchAllIfSearchKeyEmpty, recentFirst),
      undefined,
      searchKey,
      undefined,
      this._sortGroupFunc,
    );
    performanceTracer.end({ key: GROUP_PERFORMANCE_KEYS.SEARCH_GROUP });
    return {
      terms: result.terms.searchKeyTerms,
      sortableModels: result.sortableModels,
    };
  }

  private _sortGroupFunc = (
    groupA: SortableModel<Group>,
    groupB: SortableModel<Group>,
  ) => {
    return SortUtils.compareSortableModel<Group>(groupA, groupB);
  };

  private async _getRecentSearchGroups(types: RecentSearchTypes[]) {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );

    let result: Map<ModelIdType, RecentSearchModel> = new Map();
    for (const iterator of types) {
      const recentGroups = await searchService.getRecentSearchRecordsByType(
        iterator,
      );
      result = new Map([...result].concat([...recentGroups]));
    }
    return result;
  }

  private async _getTransformAllGroupFunc(
    fetchAllIfSearchKeyEmpty?: boolean,
    myGroupsOnly?: boolean,
    recentFirst?: boolean,
  ) {
    const groupConfigService = this._groupConfigService;

    const recentSearchedGroups = recentFirst
      ? await this._getRecentSearchGroups([
          RecentSearchTypes.GROUP,
          RecentSearchTypes.TEAM,
        ])
      : undefined;

    let groupName: string = '';
    let lowerCaseName: string = '';
    const currentUserId = this._currentUserId;
    return (group: Group, terms: Terms) => {
      let isMatched: boolean = false;
      let keyWeight: number = 0;
      do {
        if (!this.groupService.isValid(group)) {
          break;
        }

        const isValidGroup = myGroupsOnly
          ? group.members.includes(currentUserId)
          : !group.is_team ||
            this._isPublicTeamOrIncludeUser(group, currentUserId);
        if (!isValidGroup) {
          break;
        }

        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        const shouldFetchAll =
          fetchAllIfSearchKeyEmpty! && searchKeyTerms.length === 0;
        isMatched = shouldFetchAll && isValidGroup;
        if (isMatched || searchKeyTerms.length === 0) {
          break;
        }
        let isFuzzy: boolean = false;
        if (group.is_team) {
          groupName = group.set_abbreviation;
          lowerCaseName = groupName.toLowerCase();
          isFuzzy =
            this.entityCacheSearchController.isFuzzyMatched(
              lowerCaseName,
              searchKeyTerms,
            ) ||
            (searchKeyTermsToSoundex.length > 0 &&
              this.entityCacheSearchController.isSoundexMatched(
                this.groupService.getSoundexById(group.id),
                searchKeyTermsToSoundex,
              ));
        } else {
          const persons = this.getAllPersonOfGroup(
            group.members,
            currentUserId,
          );
          if (persons.invisiblePersons.length) {
            break;
          }
          groupName = this.getGroupNameByMultiMembers(persons.visiblePersons)
            .groupName;
          lowerCaseName = groupName.toLowerCase();
          isFuzzy =
            this.entityCacheSearchController.isFuzzyMatched(
              lowerCaseName,
              searchKeyTerms,
            ) ||
            (searchKeyTermsToSoundex.length > 0 &&
              this.entityCacheSearchController.isSoundexMatched(
                this.getSoundexValueOfGroup(persons.visiblePersons),
                searchKeyTermsToSoundex,
              ));
        }
        if (!isFuzzy) {
          break;
        }

        keyWeight = this._getNameMatchWeight(lowerCaseName, searchKeyTerms);

        isMatched = true;
      } while (false);

      if (isMatched) {
        const mostRecentViewTime = recentFirst
          ? this._getMostRecentViewTime(
              group.id,
              groupConfigService,
              recentSearchedGroups!,
            )
          : 0;
        return {
          lowerCaseName,
          id: group.id,
          displayName: groupName,
          sortWeights: [keyWeight, mostRecentViewTime],
          entity: group,
        };
      }
      return null;
    };
  }

  private _getSplitKeyWeight(
    lowerCaseSplitNames: string[],
    searchKeyTerms: string[],
  ) {
    let sortValue = 0;

    const setKeyMatched: Set<string> = new Set();
    for (let i = 0; i < lowerCaseSplitNames.length; ++i) {
      for (let j = 0; j < searchKeyTerms.length; ++j) {
        if (
          !setKeyMatched.has(searchKeyTerms[j]) &&
          this.entityCacheSearchController.isStartWithMatched(
            lowerCaseSplitNames[i],
            [searchKeyTerms[j]],
          )
        ) {
          setKeyMatched.add(searchKeyTerms[j]);
          sortValue +=
            i === j
              ? kSortingRateWithFirstAndPositionMatched
              : kSortingRateWithFirstMatched;
        }
      }
    }

    return sortValue;
  }

  private _getNameMatchWeight(lowerCaseName: string, searchKeyTerms: string[]) {
    const splitNames = this.entityCacheSearchController.getTermsFromSearchKey(
      lowerCaseName,
    );
    return this._getSplitKeyWeight(splitNames, searchKeyTerms);
  }

  // The search results should be ranked as follows: perfect match>start with> fuzzy search> Soundex search
  // If there are multiple results all in each of the categories, they should be ordered by most recent(searched and tapped/sent message to in the last 30 days)>teams I'm in>alphabetical
  private async _getTransformTeamsFunc(
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ) {
    const groupConfigService = this._groupConfigService;
    const recentSearchedTeams = recentFirst
      ? await this._getRecentSearchGroups([RecentSearchTypes.TEAM])
      : undefined;
    const teamIdsIncludeMe = this._getTeamIdsIncludeMe();
    const currentUserId = this._currentUserId;
    return (team: Group, terms: Terms) => {
      let isMatched: boolean = false;
      let keyWeight: number = 0;
      do {
        if (!this._idValidTeam(team)) {
          break;
        }

        const { searchKeyTerms, searchKeyTermsToSoundex } = terms;
        if (fetchAllIfSearchKeyEmpty && searchKeyTerms.length === 0) {
          isMatched = this._isPublicTeamOrIncludeUser(team, currentUserId);
        }

        if (isMatched || searchKeyTerms.length === 0) {
          break;
        }

        const lowerCaseAbbreviation = team.set_abbreviation.toLowerCase();
        if (
          !(
            this.entityCacheSearchController.isFuzzyMatched(
              lowerCaseAbbreviation,
              searchKeyTerms,
            ) ||
            (searchKeyTermsToSoundex.length &&
              this.entityCacheSearchController.isSoundexMatched(
                this.groupService.getSoundexById(team.id),
                searchKeyTermsToSoundex,
              ))
          )
        ) {
          break;
        }

        if (!this._isPublicTeamOrIncludeUser(team, currentUserId)) {
          break;
        }

        keyWeight = this._getNameMatchWeight(
          lowerCaseAbbreviation,
          searchKeyTerms,
        );

        isMatched = true;
      } while (false);

      if (isMatched) {
        const isMeInTeam = teamIdsIncludeMe.has(team.id) ? kTeamIncludeMe : 0;
        const mostRecentViewTime = recentFirst
          ? this._getMostRecentViewTime(
              team.id,
              groupConfigService,
              recentSearchedTeams!,
            )
          : 0;
        return {
          id: team.id,
          lowerCaseName: team.set_abbreviation.toLowerCase(),
          displayName: team.set_abbreviation,
          sortWeights: [keyWeight, mostRecentViewTime, isMeInTeam],
          entity: team,
        };
      }
      return null;
    };
  }

  async doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
    recentFirst?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }> {
    const performanceTracer = PerformanceTracer.start();

    const result = await this.entityCacheSearchController.searchEntities(
      await this._getTransformTeamsFunc(fetchAllIfSearchKeyEmpty, recentFirst),
      undefined,
      searchKey,
      undefined,
      this._sortGroupFunc,
    );
    performanceTracer.end({ key: GROUP_PERFORMANCE_KEYS.SEARCH_TEAM });
    return {
      terms: result.terms.searchKeyTerms,
      sortableModels: result.sortableModels,
    };
  }

  getAllPersonOfGroup(members: number[], currentUserId: number) {
    const visiblePersons: Person[] = [];
    const invisiblePersons: Person[] = [];
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    members.forEach((id: number) => {
      if (id === currentUserId) {
        return;
      }
      const person = personService.getSynchronously(id);
      if (person) {
        if (personService.isVisiblePerson(person)) {
          visiblePersons.push(person);
        } else {
          invisiblePersons.push(person);
        }
      }
    });
    return { invisiblePersons, visiblePersons };
  }
  getSoundexValueOfGroup(allPersons: Person[]): string[] {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    let soundexResult: string[] = [];
    allPersons.forEach((person: Person) => {
      const soundexOfPerson = personService.getSoundexById(person.id);
      soundexResult = soundexResult.concat(soundexOfPerson);
    });
    return soundexResult;
  }
  getGroupNameByMultiMembers(allPersons: Person[]) {
    const names: string[] = [];
    const emails: string[] = [];
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    allPersons.forEach((person: Person) => {
      if (person && personService.isVisiblePerson(person)) {
        const name = personService.getName(person);
        if (name.length) {
          names.push(name);
        } else {
          emails.push(person.email);
        }
      }
    });

    return {
      groupName: names
        .sort(compareName)
        .concat(emails.sort(compareName))
        .join(', '),
      memberNames: names.concat(emails),
    };
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
    return (
      team.privacy === 'protected' || this._getTeamIdsIncludeMe().has(team.id)
    );
  }

  private _getTeamIdsIncludeMe() {
    return this.groupService.getTeamIdsIncludeMe();
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
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
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
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      const currentUserId = userConfig.getGlipUserId();

      return groups.filter(
        (item: Group) =>
          this.groupService.isValid(item) &&
          this.groupService.isInGroup(currentUserId, item),
      );
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
