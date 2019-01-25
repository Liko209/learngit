/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, MyState, State } from '../entity';
import { Group } from '../../group/entity';
import { Raw } from '../../../framework/model';

interface IStateService {
  updateReadStatus(groupId: number, isUnread: boolean): Promise<void>;

  updateLastGroup(groupId: number): Promise<void>;

  getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]>;

  getGroupStatesFromLocalWithUnread(ids: number[]): Promise<GroupState[]>;

  getMyState(): Promise<MyState | null>;

  getMyStateId(): number;

  handleState(states: Raw<State>[]): Promise<void>;

  handlePartialGroup(groups: Partial<Group>[]): Promise<void>;

  handleGroupChanges(groups?: Group[]): Promise<void>;

  getUmiByIds(
    ids: number[],
    updateUmi: (unreadCounts: Map<number, number>, important: boolean) => void,
  ): Promise<void>;
}

export { IStateService };
