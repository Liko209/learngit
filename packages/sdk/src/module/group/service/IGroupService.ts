import { Group } from '../entity';

interface IGroupService {
  isInTeam(userId: number, team: Group): boolean;

  canJoinTeam(team: Group): boolean;

  joinTeam(userId: number, teamId: number): Promise<Group | null>;
}

export { IGroupService };
