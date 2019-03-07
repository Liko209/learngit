/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:41:27
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager, GroupStateDao } from '../../../dao';
import { EntityBaseService } from '../../../framework';
import { IStateService } from './IStateService';
import { GroupState, MyState, State } from '../entity';
import { SOCKET, SERVICE, ENTITY } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { StateController } from '../controller/StateController';
import { Group } from '../../group/entity';
import { Profile } from '../../profile/entity';
import { NotificationEntityPayload } from '../../../service/notificationCenter';
import { SectionUnread } from '../types';

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
        [SOCKET.PARTIAL_GROUP]: this.handleGroupCursor,
        [SERVICE.GROUP_CURSOR]: this.handleGroupCursor,
        [ENTITY.GROUP]: this.handleGroupChangeForTotalUnread,
        [ENTITY.PROFILE]: this.handleProfileChangeForTotalUnread,
      }),
    );
  }

  protected getStateController(): StateController {
    if (!this._stateController) {
      this._stateController = new StateController(this.getEntitySource());
    }
    return this._stateController;
  }

  async updateReadStatus(
    groupId: number,
    isUnread: boolean,
    ignoreError: boolean,
  ): Promise<void> {
    await this.getStateController()
      .getStateActionController()
      .updateReadStatus(groupId, isUnread, ignoreError);
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

  handleGroupCursor = async (groups: Partial<Group>[]): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handleGroupCursor(groups);
  }

  handleGroupChangeForTotalUnread = async (
    payload: NotificationEntityPayload<Group>,
  ): Promise<void> => {
    await this.getStateController()
      .getTotalUnreadController()
      .handleGroup(payload);
  }

  handleProfileChangeForTotalUnread = async (
    payload: NotificationEntityPayload<Profile>,
  ): Promise<void> => {
    await this.getStateController()
      .getTotalUnreadController()
      .handleProfile(payload);
  }

  getSingleUnreadInfo(id: number): SectionUnread | undefined {
    return this.getStateController()
      .getTotalUnreadController()
      .getSingleUnreadInfo(id);
  }
}

export { StateService };
