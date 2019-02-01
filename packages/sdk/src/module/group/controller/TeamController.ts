/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Group } from '../entity';
import { TeamActionController } from './TeamActionController';
import { GroupActionController } from './GroupActionController';
import { TeamPermissionController } from './TeamPermissionController';
import {
  buildPartialModifyController,
  buildRequestController,
} from '../../../framework/controller';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { Api } from '../../../api';

class TeamController {
  private _actionController: TeamActionController;
  private _groupActionController: GroupActionController;
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

  getGroupActionController(): GroupActionController {
    if (!this._groupActionController) {
      const partialModifyController = buildPartialModifyController<Group>(
        this.entitySourceController,
      );

      this._groupActionController = new GroupActionController(
        this.entitySourceController,
        partialModifyController,
        this.entityCacheSearchController,
        buildRequestController<Group>({
          basePath: '/group',
          networkClient: Api.glipNetworkClient,
        }),
      );
    }
    return this._groupActionController;
  }

  getTeamPermissionController(): TeamPermissionController {
    if (!this._permissionController) {
      this._permissionController = new TeamPermissionController();
    }
    return this._permissionController;
  }
}

export { TeamController };
