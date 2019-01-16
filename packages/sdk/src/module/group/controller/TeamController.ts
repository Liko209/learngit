/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../entity';
import _ from 'lodash';
import { Api } from '../../../api';
import { TeamActionController } from './TeamActionController';
import { TeamPermissionController } from './TeamPermissionController';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';
import { daoManager, GroupDao } from '../../../dao';

class TeamController {
  private _actionController: TeamActionController;
  private _permissionController: TeamPermissionController;

  constructor(public controllerBuilder: IControllerBuilder<Group>) {}

  getTeamActionController(): TeamActionController {
    if (!this._actionController) {
      const requestController = this.controllerBuilder.buildRequestController({
        basePath: '/team',
        networkClient: Api.glipNetworkClient,
      });

      const entitySourceController = this.controllerBuilder.buildEntitySourceController(
        daoManager.getDao(GroupDao),
        requestController,
      );

      const partialModifyController = this.controllerBuilder.buildPartialModifyController(
        entitySourceController,
      );

      this._actionController = new TeamActionController(
        partialModifyController,
        requestController,
        this.controllerBuilder,
      );
    }
    return this._actionController;
  }

  getTeamPermissionController(): TeamPermissionController {
    if (!this._permissionController) {
      this._permissionController = new TeamPermissionController();
    }
    return this._permissionController;
  }
}

export { TeamController };
