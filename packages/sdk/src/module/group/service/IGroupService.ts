import { Group, TeamPermission, TeamPermissionParams } from '../entity';
import { PERMISSION_ENUM } from '../constants';
import { TeamSetting, PermissionFlags } from '../types';

interface IGroupService {
  isInTeam(userId: number, team: Group): boolean;

  canJoinTeam(team: Group): boolean;

  joinTeam(userId: number, teamId: number): void;

  leaveTeam(userId: number, teamId: number): void;

  addTeamMembers(members: number[], teamId: number): void;

  removeTeamMembers(members: number[], teamId: number): void;

  isCurrentUserHasPermission(
    teamPermissionParams: TeamPermissionParams,
    type: PERMISSION_ENUM,
  ): boolean;

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean;

  updateTeamSetting(teamId: number, teamSetting: TeamSetting): Promise<void>;

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags;
}

export { IGroupService };
