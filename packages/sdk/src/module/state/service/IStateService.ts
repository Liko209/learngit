/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, MyState, State } from '../entity';
import { Group } from '../../group/entity';
import { Profile } from '../../profile/entity';
import { NotificationEntityPayload } from '../../../service/notificationCenter';

interface IStateService {
  updateReadStatus(groupId: number, isUnread: boolean): Promise<void>;

  updateLastGroup(groupId: number): Promise<void>;

  getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]>;

  getGroupStatesFromLocalWithUnread(ids: number[]): Promise<GroupState[]>;

  getMyState(): Promise<MyState | null>;

  getMyStateId(): number;

  handleState(states: Partial<State>[]): Promise<void>;

  handleGroupCursor(groups: Partial<Group>[]): Promise<void>;

  handleGroupChange(payload: NotificationEntityPayload<Group>): Promise<void>;

  handleProfileChange(
    payload: NotificationEntityPayload<Profile>,
  ): Promise<void>;

  getUmiByIds(
    ids: number[],
    updateUmi: (unreadCounts: Map<number, number>, important: boolean) => void,
  ): Promise<void>;
}

export { IStateService };
