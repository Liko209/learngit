import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import { PERMISSION_ENUM } from '../constants';
import { TeamSetting, PermissionFlags, CreateTeamOptions } from '../types';
import { QUERY_DIRECTION } from '../../../dao/constants';
import { SortableModel } from '../../../framework/model';
import { GROUP_QUERY_TYPE } from '../../../service/constants';
import { Result } from 'foundation';
import _ from 'lodash';

interface INewGroupService {
  isInTeam(userId: number, team: Group): boolean;

  canJoinTeam(team: Group): boolean;

  joinTeam(userId: number, teamId: number): Promise<void>;

  leaveTeam(userId: number, teamId: number): Promise<void>;

  addTeamMembers(members: number[], teamId: number): Promise<void>;

  removeTeamMembers(members: number[], teamId: number): Promise<void>;

  isCurrentUserHasPermission(
    teamPermissionParams: TeamPermissionParams,
    type: PERMISSION_ENUM,
  ): boolean;

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean;

  hasTeamAdmin(permission?: TeamPermission): boolean;

  updateTeamSetting(teamId: number, teamSetting: TeamSetting): Promise<void>;

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags;

  hasMorePostInRemote(
    groupId: number,
    direction: QUERY_DIRECTION,
  ): Promise<boolean>;

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
  ): Promise<Group[]>;

  getGroupsByIds(ids: number[]): Promise<Group[]>;

  getLocalGroup(personIds: number[]): Promise<Group | null>;

  getGroupByPersonId(personId: number): Promise<Result<Group>>;

  getOrCreateGroupByMemberList(members: number[]): Promise<Result<Group>>;

  requestRemoteGroupByMemberList(members: number[]): Promise<Result<Group>>;

  canPinPost(postId: number, group: Group): boolean;

  pinPost(postId: number, groupId: number, toPin: boolean): Promise<void>;

  getPermissions(group: Group): PERMISSION_ENUM[];

  createTeam(
    name: string,
    creator: number,
    memberIds: (number | string)[],
    description: string,
    options: CreateTeamOptions,
  ): Promise<Result<Group>>;

  getLeftRailGroups(): Promise<Group[]>;

  updateGroupPrivacy(params: { id: number; privacy: string }): Promise<void>;

  isFavored(id: number, type: number): Promise<boolean>;

  doFuzzySearchGroups(
    searchKey: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null>;

  doFuzzySearchTeams(
    searchKey?: string,
    fetchAllIfSearchKeyEmpty?: boolean,
  ): Promise<{
    terms: string[];
    sortableModels: SortableModel<Group>[];
  } | null>;

  getGroupEmail(groupId: number): Promise<string>;

  setAsTrue4HasMoreConfigByDirection(
    ids: number[],
    direction: QUERY_DIRECTION,
  ): Promise<void>;

  updateGroupLastAccessedTime(params: {
    id: number;
    timestamp: number;
  }): Promise<boolean>;

  isGroupCanBeShown(groupId: number): Promise<boolean>;
}

export { INewGroupService };
