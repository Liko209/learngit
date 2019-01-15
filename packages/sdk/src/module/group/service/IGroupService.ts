import { Group, TeamPermission } from '../entity';
import { PERMISSION_ENUM } from '../constants';

interface IGroupService {
  isInTeam(userId: number, team: Group): boolean;

  canJoinTeam(team: Group): boolean;

  joinTeam(userId: number, teamId: number): Promise<Group | null>;

  leaveTeam(userId: number, teamId: number): Promise<Group | null>;

  addTeamMembers(members: number[], teamId: number): Promise<Group | null>;

  removeTeamMembers(members: number[], teamId: number): Promise<Group | null>;

  isCurrentUserHasPermission(group: Group, type: PERMISSION_ENUM): boolean;

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean;
}

export { IGroupService };
