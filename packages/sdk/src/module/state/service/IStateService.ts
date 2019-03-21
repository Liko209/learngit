/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, MyState, State } from '../entity';
import { Group } from '../../group/entity';
import { Profile } from '../../profile/entity';
import { NotificationEntityPayload } from '../../../service/notificationCenter';
import { SectionUnread } from '../types';
import { SYNC_SOURCE } from '../../sync/types';

interface IStateService {
  updateReadStatus(
    groupId: number,
    isUnread: boolean,
    ignoreError: boolean,
  ): Promise<void>;

  updateLastGroup(groupId: number): Promise<void>;

  getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]>;

  getGroupStatesFromLocalWithUnread(ids: number[]): Promise<GroupState[]>;

  getMyState(): Promise<MyState | null>;

  getMyStateId(): number;

  handleState(states: Partial<State>[], source: SYNC_SOURCE): Promise<void>;

  handleGroupCursor(groups: Partial<Group>[]): Promise<void>;

  handleGroupChangeForTotalUnread(
    payload: NotificationEntityPayload<Group>,
  ): void;

  handleProfileChangeForTotalUnread(
    payload: NotificationEntityPayload<Profile>,
  ): void;

  getSingleUnreadInfo(id: number): SectionUnread | undefined;
}

export { IStateService };
