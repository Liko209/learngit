/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:38:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Api } from '../../../api';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { buildRequestController } from '../../../framework/controller';
import { StateActionController } from './implementation/StateActionController';
import { StateDataHandleController } from './implementation/StateDataHandleController';
import { StateFetchDataController } from './implementation/StateFetchDataController';
import { TotalUnreadController } from './implementation/TotalUnreadController';
import { GroupState, State } from '../entity';
import { IGroupService } from '../../../module/group/service/IGroupService';

class StateController {
  private _stateActionController: StateActionController;
  private _stateDataHandleController: StateDataHandleController;
  private _stateFetchDataController: StateFetchDataController;
  private _totalUnreadController: TotalUnreadController;
  constructor(
    private _groupService: IGroupService,
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {}

  getStateActionController(): StateActionController {
    if (!this._stateActionController) {
      const requestController = buildRequestController<State>({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      this._stateActionController = new StateActionController(
        this._groupService,
        this._entitySourceController,
        requestController,
        this.getStateFetchDataController(),
      );
    }
    return this._stateActionController;
  }

  getStateDataHandleController(): StateDataHandleController {
    if (!this._stateDataHandleController) {
      this._stateDataHandleController = new StateDataHandleController(
        this._entitySourceController,
        this.getStateFetchDataController(),
      );
    }
    return this._stateDataHandleController;
  }

  getStateFetchDataController(): StateFetchDataController {
    if (!this._stateFetchDataController) {
      this._stateFetchDataController = new StateFetchDataController(
        this._entitySourceController,
      );
    }
    return this._stateFetchDataController;
  }

  getTotalUnreadController(): TotalUnreadController {
    if (!this._totalUnreadController) {
      this._totalUnreadController = new TotalUnreadController(
        this._groupService,
        this._entitySourceController,
      );
    }
    return this._totalUnreadController;
  }
}
export { StateController };
