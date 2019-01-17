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

class StateService extends EntityBaseService implements IStateService {
  static serviceName = 'StateService';
  private _stateController: StateController;
  constructor() {
    super();
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.STATE]: this.handleState,
        [SOCKET.PARTIAL_STATE]: this.handlePartialState,
        [SOCKET.PARTIAL_GROUP]: this.handlePartialGroup,
      }),
    );
  }

  protected getStateController(): StateController {
    if (!this._stateController) {
      this._stateController = new StateController();
    }
    return this._stateController;
  }

  async updateReadStatus(groupId: number, readStatus: boolean): Promise<void> {}

  async updateLastGroup(groupId: number): Promise<void> {}

  async getGroupStatesFromLocalWithUnread(
    ids: number[],
  ): Promise<GroupState[]> {
    const states = await this.getAllGroupStatesFromLocal(ids);
    const result = states.filter((item: GroupState) => {
      return item.unread_count || item.unread_mentions_count;
    });
    return result;
  }

  async getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]> {
    const groupStateDao = daoManager.getDao(GroupStateDao);
    return groupStateDao.getByIds(ids);
  }

  async getMyState(): Promise<MyState | null> {
    return null;
  }

  async handleState() {}

  async handlePartialState() {}

  async handlePartialGroup() {}
}

export { StateService };
