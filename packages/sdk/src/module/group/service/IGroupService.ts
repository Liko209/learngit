import { QUERY_DIRECTION } from '../../../dao/constants';
import { Raw, SortableModel } from '../../../framework/model';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { PERMISSION_ENUM } from '../constants';
import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import {
  PermissionFlags,
  TeamSetting,
  GroupCanBeShownResponse,
} from '../types';
import { SYNC_SOURCE } from '../../sync/types';
import { Post } from 'sdk/module/post/entity';
import { UndefinedAble } from 'sdk/types';
import { FuzzySearchGroupOptions } from '../entity/Group';

interface IGroupService {
  isValid(group: Group): boolean;

  handleData(groups: Raw<Group>[], source: SYNC_SOURCE): Promise<void>;

  isInTeam(userId: number, team: Group): boolean;

  isInGroup(userId: number, team: Group): boolean;

  canJoinTeam(team: Group): boolean;

  joinTeam(userId: number, teamId: number): Promise<void>;

  leaveTeam(userId: number, teamId: number): Promise<void>;

  addTeamMembers(members: number[], teamId: number): Promise<void>;

  removeTeamMembers(members: number[], teamId: number): Promise<void>;

  isCurrentUserHasPermission(
    type: PERMISSION_ENUM,
    teamPermissionParams: TeamPermissionParams,
  ): boolean;

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean;

  hasTeamAdmin(permission?: TeamPermission): boolean;

  updateTeamSetting(teamId: number, teamSetting: TeamSetting): Promise<void>;

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags;

  hasMorePostInRemote(
    groupId: number,
  ): Promise<{ older: boolean; newer: boolean; both: boolean }>;

  updateHasMore(
    groupId: number,
    direction: QUERY_DIRECTION,
    hasMore: boolean,
  ): void;

  archiveTeam(teamId: number): Promise<void>;

  deleteTeam(teamId: number): Promise<void>;

  makeAdmin(teamId: number, member: number): Promise<void>;

  revokeAdmin(teamId: number, member: number): Promise<void>;

  getGroupsByType(
    groupType: GROUP_QUERY_TYPE,
    offset: number,
    _limit?: number,
    pageSize?: number,
  ): Promise<{ data: Group[]; hasMore: boolean }>;

  getGroupsByIds(ids: number[], order?: boolean): Promise<Group[]>;

  getLocalGroup(personIds: number[]): Promise<Group | null>;

  getOrCreateGroupByMemberList(members: number[]): Promise<Group>;

  doFuzzySearchAllGroups(
    searchKey: UndefinedAble<string>,
    option: FuzzySearchGroupOptions,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }>;

  pinPost(postId: number, groupId: number, toPin: boolean): Promise<void>;

  createTeam(
    creator: number,
    memberIds: (number | string)[],
    options: TeamSetting,
  ): Promise<Group>;

  updateGroupPrivacy(params: { id: number; privacy: string }): Promise<void>;

  isFavored(id: number, type: number): Promise<boolean>;

  doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }>;

  doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  }>;

  getGroupEmail(groupId: number): Promise<string>;

  setAsTrue4HasMoreConfigByDirection(
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void>;

  updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean>;

  isGroupCanBeShown(groupId: number): Promise<GroupCanBeShownResponse>;

  deleteGroupsConfig(ids: number[]): Promise<void>;

  getIndividualGroups(): Map<number, Group>;

  isIndividualGroup(group: Group): boolean;

  getById(id: number): Promise<Group | null>;

  isValid(group: Group): boolean;

  getEntities(): Promise<Group[]>;

  getSoundexById(id: number): string[];

  getTeamIdsIncludeMe(): Set<number>;

  handleGroupFetchedPosts(groupId: number, posts: Post[]): void;

  sendTypingEvent(groupId: number, isClear: boolean): void;

  getSynchronously(id: number): Group | null;

  getGroupName(group: Group): string;

  clearDraftFlagIfNotReallyExisted(groupId: number): Promise<void>;

  isSMSGroup(group: Group): boolean;
}

export { IGroupService };
