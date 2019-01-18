/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:38:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Api } from '../../../api';
import { GroupState } from '../entity/State';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import { IControllerBuilder } from '../../../framework/controller/interface/IControllerBuilder';
import { StateActionController } from './implementation/StateActionController';
import { StateDataHandleController } from './implementation/StateDataHandleController';
import { StateFetchDataController } from './implementation/StateFetchDataController';

class StateController {
  private _stateActionController: StateActionController;
  private _stateDataHandleController: StateDataHandleController;
  private _stateFetchDataController: StateFetchDataController;
  constructor(
    private _controllerBuilder: IControllerBuilder<GroupState>,
    private _entitySourceController: IEntitySourceController,
  ) {}

  getStateActionController(): StateActionController {
    if (!this._stateActionController) {
      const partialModifyController = this._controllerBuilder.buildPartialModifyController(
        this._entitySourceController,
      );
      const requestController = this._controllerBuilder.buildRequestController({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      this._stateActionController = new StateActionController(
        partialModifyController,
        requestController,
        this._entitySourceController,
      );
    }
    return this._stateActionController;
  }

  getStateDataHandleController(): StateDataHandleController {
    if (!this._stateDataHandleController) {
      this._stateDataHandleController = new StateDataHandleController();
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
}
export { StateController };
