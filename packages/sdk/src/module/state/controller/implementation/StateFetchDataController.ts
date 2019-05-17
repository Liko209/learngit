/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-17 13:39:26
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { daoManager } from '../../../../dao';
import { StateDao } from '../../dao';
import { GroupState, MyState } from '../../entity/State';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { StateService } from '../../service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
class StateFetchDataController {
  private _myStateId: number;
  constructor(
    private _entitySourceController: IEntitySourceController<GroupState>,
  ) {}

  async getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]> {
    return await this._entitySourceController.getEntitiesLocally(ids, false);
  }

  async getGroupStatesFromLocalWithUnread(
    ids: number[],
  ): Promise<GroupState[]> {
    const groupStates = await this.getAllGroupStatesFromLocal(ids);
    return groupStates.filter((groupState: GroupState) => {
      return groupState.unread_count || groupState.unread_mentions_count;
    });
  }

  async getMyState(): Promise<MyState | null> {
    return await daoManager.getDao(StateDao).getFirst();
  }

  getMyStateId(): number {
    if (!this._myStateId || this._myStateId <= 0) {
      const userConfig = ServiceLoader.getInstance<StateService>(
        ServiceConfig.STATE_SERVICE,
      ).myStateConfig;
      this._myStateId = userConfig.getMyStateId();
    }
    return this._myStateId;
  }
}

export { StateFetchDataController };
