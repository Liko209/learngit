/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Group } from '../entity';
import { GroupActionController } from './GroupActionController';
import { TeamPermissionController } from './TeamPermissionController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { GroupFetchDataController } from './GroupFetchDataController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { INewGroupService } from '../service/INewGroupService';

class GroupController {
  private _groupActionController: GroupActionController;
  private _groupFetchDataController: GroupFetchDataController;
  private _permissionController: TeamPermissionController;

  constructor(
    public groupService: INewGroupService,
    public entitySourceController: IEntitySourceController<Group>,
    public entityCacheSearchController: IEntityCacheSearchController<Group>,
    public partialModifyController: IPartialModifyController<Group>,
  ) {}

  getGroupActionController(): GroupActionController {
    if (!this._groupActionController) {
      this._groupActionController = new GroupActionController(
        this.groupService,
        this.entitySourceController,
        this.partialModifyController,
        this.getTeamPermissionController(),
      );
    }
    return this._groupActionController;
  }

  getGroupFetchDataController(): GroupFetchDataController {
    if (!this._groupFetchDataController) {
      this._groupFetchDataController = new GroupFetchDataController(
        this.groupService,
        this.entitySourceController,
        this.partialModifyController,
        this.entityCacheSearchController,
      );
    }
    return this._groupFetchDataController;
  }

  getTeamPermissionController(): TeamPermissionController {
    if (!this._permissionController) {
      this._permissionController = new TeamPermissionController();
    }
    return this._permissionController;
  }
}

export { GroupController };
