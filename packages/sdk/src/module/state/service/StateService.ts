/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:41:27
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, GroupStateDao } from '../../../dao';
import { EntityBaseService } from '../../../framework';
import { IStateService } from './IStateService';
import { GroupState, MyState } from '../entity';
import { SOCKET } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { StateController } from '../controller/StateController';
import { IEntitySourceController } from '../../../framework/controller/interface/IEntitySourceController';

class StateService extends EntityBaseService<GroupState>
  implements IStateService {
  static serviceName = 'StateService';
  private _stateController: StateController;
  private _entitySourceController: IEntitySourceController;
  constructor() {
    super();
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.STATE]: this.handleState,
        [SOCKET.GROUP]: this.handleGroup,
        [SOCKET.PARTIAL_STATE]: this.handlePartialState,
        [SOCKET.PARTIAL_GROUP]: this.handlePartialGroup,
      }),
    );
  }

  private _getEntitySourceController() {
    if (!this._entitySourceController) {
      this._entitySourceController = this.getControllerBuilder().buildEntitySourceController(
        daoManager.getDao(GroupStateDao),
      );
    }
    return this._entitySourceController;
  }

  protected getStateController(): StateController {
    if (!this._stateController) {
      this._stateController = new StateController(
        this.getControllerBuilder(),
        this._getEntitySourceController(),
      );
    }
    return this._stateController;
  }

  async updateReadStatus(groupId: number, readStatus: boolean): Promise<void> {}

  async updateLastGroup(groupId: number): Promise<void> {}

  async getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]> {
    return await this.getStateController()
      .getStateFetchDataController()
      .getAllGroupStatesFromLocal(ids);
  }

  async getGroupStatesFromLocalWithUnread(
    ids: number[],
  ): Promise<GroupState[]> {
    return await this.getStateController()
      .getStateFetchDataController()
      .getGroupStatesFromLocalWithUnread(ids);
  }

  async getMyState(): Promise<MyState | null> {
    return await this.getStateController()
      .getStateFetchDataController()
      .getMyState();
  }

  async getMyStateId(): Promise<number> {
    return await this.getStateController()
      .getStateFetchDataController()
      .getMyStateId();
  }

  async handleState(): Promise<void> {}

  async handlePartialState(): Promise<void> {}

  async handlePartialGroup(): Promise<void> {}

  async handleGroup(): Promise<void> {
    // favorite member deactivated
  }
}

export { StateService };
