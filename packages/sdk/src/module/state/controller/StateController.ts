/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:38:58
 * Copyright © RingCentral. All rights reserved.
 */

import { Api } from '../../../api';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';
import {
  buildPartialModifyController,
  buildRequestController,
} from '../../../framework/controller';
import { StateActionController } from './implementation/StateActionController';
import { StateDataHandleController } from './implementation/StateDataHandleController';
import { StateFetchDataController } from './implementation/StateFetchDataController';
import { GroupState, State } from '../entity';

class StateController {
  private _stateActionController: StateActionController;
  private _stateDataHandleController: StateDataHandleController;
  private _stateFetchDataController: StateFetchDataController;
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {}

  getStateActionController(): StateActionController {
    if (!this._stateActionController) {
      const partialModifyController = buildPartialModifyController<GroupState>(
        this._entitySourceController,
      );
      const requestController = buildRequestController<State>({
        basePath: '/save_state_partial',
        networkClient: Api.glipNetworkClient,
      });
      this._stateActionController = new StateActionController(
        partialModifyController,
        requestController,
        this._entitySourceController,
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
}
export { StateController };
