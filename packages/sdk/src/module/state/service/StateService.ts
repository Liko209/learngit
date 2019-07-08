/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:41:27
 * Copyright © RingCentral. All rights reserved.
 */

import { daoManager } from '../../../dao';
import { GroupStateDao } from '../dao';
import { EntityBaseService } from '../../../framework';
import { IStateService } from './IStateService';
import { GroupState, MyState, State } from '../entity';
import { SOCKET, SERVICE, ENTITY } from '../../../service/eventKey';
import { SubscribeController } from '../../base/controller/SubscribeController';
import { StateController } from '../controller/StateController';
import { Group } from '../../group/entity';
import { IGroupService } from '../../group/service/IGroupService';
import { Profile } from '../../profile/entity';
import { NotificationEntityPayload } from '../../../service/notificationCenter';
import { GroupBadge } from '../types';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { MyStateConfig } from '../config';
import { UndefinedAble } from 'sdk/types';

class StateService extends EntityBaseService<GroupState>
  implements IStateService {
  private _stateController: StateController;
  private _myStateConfig: MyStateConfig;
  constructor(private _groupService: IGroupService) {
    super({ isSupportedCache: true }, daoManager.getDao(GroupStateDao));
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SOCKET.STATE]: this.handleState,
        [SOCKET.PARTIAL_STATE]: this.handleState,
        [SOCKET.PARTIAL_GROUP]: this.handleGroupCursor,
        [SERVICE.GROUP_CURSOR]: (data: Partial<Group>[]) => {
          this.handleGroupCursor(data, true);
        },
        [ENTITY.GROUP]: this.handleGroupChangeForTotalUnread,
        [ENTITY.PROFILE]: this.handleProfileChangeForTotalUnread,
        [ENTITY.GROUP_STATE]: this.handleStateChangeForTotalUnread,
      }),
    );

    this.setCheckTypeFunc((id: number) => {
      return (
        GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_TEAM) ||
        GlipTypeUtil.isExpectedType(id, TypeDictionary.TYPE_ID_GROUP)
      );
    });
  }

  onGlipLogin(success: boolean) {
    super.onGlipLogin(success);
    success && this._initBadge();
  }

  private _initBadge = async () => {
    await this.getStateController()
      .getTotalUnreadController()
      .initializeTotalUnread();
  }

  protected getStateController(): StateController {
    if (!this._stateController) {
      this._stateController = new StateController(
        this._groupService,
        this.getEntitySource(),
      );
    }
    return this._stateController;
  }

  get myStateConfig() {
    if (!this._myStateConfig) {
      this._myStateConfig = new MyStateConfig();
    }
    return this._myStateConfig;
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

  handleState = async (
    states: Partial<State>[],
    source: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handleState(states, source, changeMap);
  }

  handleGroupCursor = async (
    groups: Partial<Group>[],
    ignoreCursorValidate?: boolean,
  ): Promise<void> => {
    await this.getStateController()
      .getStateDataHandleController()
      .handleGroupCursor(groups, ignoreCursorValidate);
  }

  handleStateChangeForTotalUnread = (
    payload: NotificationEntityPayload<GroupState>,
  ): void => {
    this.getStateController()
      .getTotalUnreadController()
      .handleGroupState(payload);
  }

  handleGroupChangeForTotalUnread = (
    payload: NotificationEntityPayload<Group>,
  ): void => {
    this.getStateController()
      .getTotalUnreadController()
      .handleGroup(payload);
  }

  handleProfileChangeForTotalUnread = (
    payload: NotificationEntityPayload<Profile>,
  ): void => {
    this.getStateController()
      .getTotalUnreadController()
      .handleProfile(payload);
  }

  getSingleGroupBadge(id: number): UndefinedAble<GroupBadge> {
    return this.getStateController()
      .getTotalUnreadController()
      .getSingleGroupBadge(id);
  }
}

export { StateService };
