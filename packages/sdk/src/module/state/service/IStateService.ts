/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, MyState, State } from '../entity';
import { Group } from '../../group/entity';
import { Profile } from '../../profile/entity';
import { NotificationEntityPayload } from '../../../service/notificationCenter';
import { GroupBadge } from '../types';
import { SYNC_SOURCE, ChangeModel } from '../../sync/types';
import { UndefinedAble } from 'sdk/types';

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

  handleState(
    states: Partial<State>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void>;

  handleGroupCursor(
    groups: Partial<Group>[],
    source?: SYNC_SOURCE,
    changeMap?: Map<string, ChangeModel>,
  ): Promise<void>;

  handleGroupChangeForTotalUnread(groups: Group[]): Promise<void>;

  handleProfileChangeForTotalUnread(
    payload: NotificationEntityPayload<Profile>,
  ): Promise<void>;

  getSingleGroupBadge(id: number): UndefinedAble<GroupBadge>;
}

export { IStateService };
