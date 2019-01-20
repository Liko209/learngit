/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */

import { Group } from '../entity';
import _ from 'lodash';
import { TeamActionController } from './TeamActionController';
import { TeamPermissionController } from './TeamPermissionController';
import { buildPartialModifyController } from '../../../framework/controller';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class TeamController {
  private _actionController: TeamActionController;
  private _permissionController: TeamPermissionController;

  constructor(public entitySourceController: IEntitySourceController<Group>) {}

  getTeamActionController(): TeamActionController {
    if (!this._actionController) {
      const partialModifyController = buildPartialModifyController<Group>(
        this.entitySourceController,
      );

      this._actionController = new TeamActionController(
        partialModifyController,
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
