/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';

import { buildPartialModifyController } from '../../../framework/controller';
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { Group } from '../entity';
import { TeamActionController } from './TeamActionController';
import { TeamPermissionController } from './TeamPermissionController';

class TeamController {
  private _actionController: TeamActionController;
  private _permissionController: TeamPermissionController;

  constructor(
    public entitySourceController: IEntitySourceController<Group>,
    public entityCacheSearchController: IEntityCacheSearchController<Group>,
  ) {}

  getTeamActionController(): TeamActionController {
    if (!this._actionController) {
      const partialModifyController = buildPartialModifyController<Group>(
        this.entitySourceController,
      );

      this._actionController = new TeamActionController(
        partialModifyController,
        this.entitySourceController,
        this.getTeamPermissionController(),
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
