/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:27:54
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamController } from '../controller/TeamController';
import { Group } from '../entity';
import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { IGroupService } from './IGroupService';
import { daoManager, GroupDao } from '../../../dao';
import { Api } from '../../../api';
class GroupService extends EntityBaseService<Group> implements IGroupService {
  teamController: TeamController;
  constructor() {
    super();
    this.setEntitySource(this._buildEntitySourceController());
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

  private _buildEntitySourceController() {
    const requestController = this.getControllerBuilder().buildRequestController(
      {
        basePath: '/team',
        networkClient: Api.glipNetworkClient,
      },
    );
    return this.getControllerBuilder().buildEntitySourceController(
      daoManager.getDao(GroupDao),
      requestController,
    );
  }
}

export { GroupService };
