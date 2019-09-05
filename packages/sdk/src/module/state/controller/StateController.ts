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
import { IGroupService } from '../../group/service/IGroupService';

class StateController {
  private _stateActionController: StateActionController;
  private _stateDataHandleController: StateDataHandleController;
  private _stateFetchDataController: StateFetchDataController;
  private _totalUnreadController: TotalUnreadController;
  constructor(
    private _groupService: IGroupService,
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {}

  get stateActionController(): StateActionController {
    if (!this._stateActionController) {
      const requestController = buildRequestController<State>({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      this._stateActionController = new StateActionController(
        this._groupService,
        this._entitySourceController,
        requestController,
        this.stateFetchDataController,
      );
    }
    return this._stateActionController;
  }

  get stateDataHandleController(): StateDataHandleController {
    if (!this._stateDataHandleController) {
      this._stateDataHandleController = new StateDataHandleController(
        this._entitySourceController,
        this.stateActionController,
        this._groupService,
      );
    }
    return this._stateDataHandleController;
  }

  get stateFetchDataController(): StateFetchDataController {
    if (!this._stateFetchDataController) {
      this._stateFetchDataController = new StateFetchDataController(
        this._entitySourceController,
      );
    }
    return this._stateFetchDataController;
  }

  get totalUnreadController(): TotalUnreadController {
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
