/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:28:33
 * Copyright © RingCentral. All rights reserved.
 */
import { IEntityCacheSearchController } from '../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../framework/controller/interface/IPartialModifyController';
import { Group } from '../entity';
import { IGroupService } from '../service/IGroupService';
import { GroupActionController } from './GroupActionController';
import { GroupFetchDataController } from './GroupFetchDataController';
import { GroupHandleDataController } from './GroupHandleDataController';
import { TeamPermissionController } from './TeamPermissionController';

class GroupController {
  private _groupActionController: GroupActionController;
  private _groupFetchDataController: GroupFetchDataController;
  private _permissionController: TeamPermissionController;
  private _groupHandleDataController: GroupHandleDataController;

  constructor(
    public groupService: IGroupService,
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
        this.getHandleDataController(),
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
        this.getHandleDataController(),
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

  getHandleDataController(): GroupHandleDataController {
    if (!this._groupHandleDataController) {
      this._groupHandleDataController = new GroupHandleDataController(
        this.groupService,
        this.entitySourceController,
      );
    }
    return this._groupHandleDataController;
  }
}

export { GroupController };
