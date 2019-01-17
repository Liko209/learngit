/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-16 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupState, MyState } from '../entity';
interface IStateService {
  updateReadStatus(groupId: number, readStatus: boolean): Promise<void>;

  updateLastGroup(groupId: number): Promise<void>;

  getGroupStatesFromLocalWithUnread(ids: number[]): Promise<GroupState[]>;

  getAllGroupStatesFromLocal(ids: number[]): Promise<GroupState[]>;

  getMyState(): Promise<MyState | null>;
}

export { IStateService };
