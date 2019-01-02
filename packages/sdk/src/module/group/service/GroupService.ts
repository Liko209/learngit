/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../controller/TeamController';
import { Group } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';

class GroupService extends EntityBaseService<Group> {
  teamController: TeamController;
  constructor() {
    super();
  }

  protected getTeamController() {
    if (!this.teamController) {
      this.teamController = new TeamController(this.getControllerBuilder());
    }
    return this.teamController;
  }

  isInTeam(userId: number, team: Group) {
    return this.getTeamController()
      .getTeamActionController()
      .isInTeam(userId, team);
  }

  canJoinTeam(team: Group) {
    return this.getTeamController()
      .getTeamActionController()
      .canJoinTeam(team);
  }

  async joinTeam(userId: number, teamId: number): Promise<Group | null> {
    return await this.getTeamController()
      .getTeamActionController()
      .joinTeam(userId, teamId);
  }

}

export { GroupService };
