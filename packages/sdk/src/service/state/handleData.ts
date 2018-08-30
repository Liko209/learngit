/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-04-16 09:35:30
 * Copyright © RingCentral. All rights reserved.
 */
import { daoManager } from '../../dao';
import StateDao from '../../dao/state';
import GroupStateDao from '../../dao/groupState';
import notificationCenter from '../../service/notificationCenter';
import { ENTITY } from '../../service/eventKey';
import { State, GroupState, Raw } from '../../models';
import _ from 'lodash';

export type TransformedState = State & {
  groupState: GroupState[];
};

export function transform(item: Raw<State> | Partial<Raw<State>>): TransformedState {
  const clone = Object.assign({}, item);
  const groupIds = new Set();
  const groupStates = {};

  Object.keys(clone).forEach((key) => {
    if (key === '_id') {
      clone.id = clone._id;
      delete clone[key];
    }
    const keys = [
      'deactivated_post_cursor',
      'group_missed_calls_count',
      'group_tasks_count',
      'last_read_through',
      'unread_count',
      'unread_mentions_count',
      'read_through',
      'marked_as_unread',
      'post_cursor',
      'previous_post_cursor',
    ];
    const m = key.match(new RegExp(`(${keys.join('|')}):(\\d+)`));
    if (m) {
      const groupState = m[1];
      const groupId = m[2];
      const value = clone[key];
      if (!groupStates[groupId]) {
        groupStates[groupId] = {
          id: Number(groupId),
        };
      }
      groupStates[groupId][groupState] = value;
      groupIds.add(groupId);
      delete clone[key];
    }
  });
  (clone as TransformedState).groupState = [...Array.from(groupIds)].map(id => groupStates[id]);
  clone.away_status_history = clone.away_status_history || [];
  return clone as TransformedState;
  /* eslint-enable no-underscore-dangle */
}

export async function getPartialStates(state: Partial<Raw<State>>[]) {
  const transformedData: TransformedState[] = [];
  const myState: State[] = [];
  let groupStates: GroupState[] = [];

  state.forEach((item) => {
    const transformed: TransformedState = transform(item);
    transformedData.push(transformed);
    const { groupState, ...rest } = transformed;
    const groupStateDao = daoManager.getDao(GroupStateDao);
    _.map(groupState, async (state: GroupState) => {
      const originState = await groupStateDao.get(state.id);
      return originState;
    });
    groupStates = groupStates.concat(groupState);

    if (Object.keys(rest).length) {
      myState.push(rest);
    }
  });
  return { myState, groupStates, transformedData };
}

export function getStates(state: Raw<State>[]) {
  const transformedData: TransformedState[] = [];
  const myState: State[] = [];
  let groupStates: GroupState[] = [];

  state.forEach((item) => {
    const transformed: TransformedState = transform(item);
    transformedData.push(transformed);
    const { groupState, ...rest } = transformed;
    groupStates = groupStates.concat(groupState);

    if (Object.keys(rest).length) {
      myState.push(rest);
    }
  });
  return { myState, groupStates, transformedData };
}

export default async function stateHandleData(state: Raw<State>[]) {
  if (state.length === 0) {
    return;
  }
  const stateDao = daoManager.getDao(StateDao);
  const groupStateDao = daoManager.getDao(GroupStateDao);
  // const state = [].concat(data);
  const savePromises: Promise<void>[] = [];
  const { myState, groupStates } = getStates(state);

  notificationCenter.emitEntityPut(ENTITY.MY_STATE, myState);
  savePromises.push(stateDao.bulkUpdate(myState));

  if (groupStates.length) {
    notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, groupStates);
    savePromises.push(groupStateDao.bulkUpdate(groupStates));
  }

  await Promise.all(savePromises);
}

export async function handlePartialData(state: Partial<State>[]) {
  if (state.length === 0) {
    return;
  }
  const stateDao = daoManager.getDao(StateDao);
  const groupStateDao = daoManager.getDao(GroupStateDao);
  const savePromises: Promise<void>[] = [];
  const { myState, groupStates } = await getPartialStates(state);
  notificationCenter.emitEntityPut(ENTITY.MY_STATE, myState);
  savePromises.push(stateDao.bulkUpdate(myState));
  if (groupStates.length) {
    notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, groupStates);
    savePromises.push(groupStateDao.bulkUpdate(groupStates));
  }
}
// export { getStates, transform };
// export default stateHandleData;
