/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:41:27
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, GroupStateDao } from '../../../dao';
import { EntityBaseService } from '../../../framework';
import { IStateService } from './IStateService';
import { GroupState, MyState, State } from '../entity';
import { SOCKET, SERVICE } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { StateController } from '../controller/StateController';
import { Group } from '../../group/entity';

class StateService extends EntityBaseService<GroupState>
  implements IStateService {
  static serviceName = 'StateService';
  private _stateController: StateController;
  constructor() {
    super(true, daoManager.getDao(GroupStateDao));
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.STATE]: this.handleState,
        [SOCKET.PARTIAL_STATE]: this.handleState,
        [SOCKET.PARTIAL_GROUP]: this.handlePartialGroup,
        [SERVICE.GROUP_CURSOR]: this.handleGroupChanges,
      }),
    );
  }

  protected getStateController(): StateController {
    if (!this._stateController) {
      this._stateController = new StateController(this.getEntitySource());
    }
    return this._stateController;
  }

  async updateReadStatus(groupId: number, isUnread: boolean): Promise<void> {
    await this.getStateController()
      .getStateActionController()
      .updateReadStatus(groupId, isUnread);
  }

  async updateLastGroup(groupId: number): Promise<void> {
    await this.getStateController()
      .getStateActionController()
      .updateLastGroup(groupId);
  }

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

  getMyStateId(): number {
    return this.getStateController()
      .getStateFetchDataController()
      .getMyStateId();
  }

  handleState = async (states: Partial<State>[]): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handleState(states);
  }

  handlePartialGroup = async (groups: Partial<Group>[]): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handlePartialGroup(groups);
  }

  handleGroupChanges = async (groups?: Group[]): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handleGroupChanges(groups);
  }

  async getUmiByIds(
    ids: number[],
    updateUmi: (unreadCounts: Map<number, number>, important: boolean) => void,
  ): Promise<void> {
    await this.getStateController()
      .getStateFetchDataController()
      .getUmiByIds(ids, updateUmi);
  }
}

export { StateService };
