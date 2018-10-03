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
import StateService from '.';
import { State, GroupState, Group, Raw } from '../../models';
import _ from 'lodash';
import { mainLogger } from 'foundation';

export type TransformedState = State & {
  groupState: GroupState[];
};

export function transform(
  item: Raw<State> | Partial<Raw<State>>,
): TransformedState {
  const clone = Object.assign({}, item);
  const groupIds = new Set();
  const groupStates = {};

  Object.keys(clone).forEach((key: string) => {
    if (key === '_id') {
      clone.id = clone._id;
      delete clone[key];
    }
    const keys = [
      'deactivated_post_cursor',
      'group_missed_calls_count',
      'group_tasks_count',
      'last_read_through',
      // 'unread_count', this field is generated in new UMI implementation
      'unread_mentions_count',
      'read_through',
      'marked_as_unread',
      'post_cursor',
      'previous_post_cursor',
      'unread_deactivated_count',
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

  (clone as TransformedState).groupState = [...Array.from(groupIds)].map(
    id => groupStates[id],
  );
  if (item && item.trigger_ids) {
    (clone as TransformedState).groupState.forEach((state: GroupState) => {
      state.trigger_ids = item.trigger_ids;
    });
  }
  clone.away_status_history = clone.away_status_history || [];
  return clone as TransformedState;
  /* eslint-enable no-underscore-dangle */
}

export async function getPartialStates(state: Partial<Raw<State>>[]) {
  const transformedData: TransformedState[] = [];
  const myState: State[] = [];
  let groupStates: GroupState[] = [];

  state.forEach((item: Partial<Raw<State>>) => {
    const transformed: TransformedState = transform(item);
    transformedData.push(transformed);
    const { groupState, ...rest } = transformed;
    // const groupStateDao = daoManager.getDao(GroupStateDao);
    // _.map(groupState, async (state: GroupState) => {
    //   const originState = await groupStateDao.get(state.id);
    //   return originState;
    // });
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

  state.forEach((item: Raw<State>) => {
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
  console.time('stateHandleData');

  if (state.length === 0) {
    return;
  }
  const { myState, groupStates } = getStates(state);
  await operateDaoAndDoNotification(myState, groupStates);
  console.timeEnd('stateHandleData');
}

async function operateDaoAndDoNotification(
  myState?: State[],
  groupStates?: GroupState[],
) {
  const stateDao = daoManager.getDao(StateDao);
  const groupStateDao = daoManager.getDao(GroupStateDao);
  if (myState) {
    await stateDao.bulkUpdate(myState);
    notificationCenter.emitEntityPut(ENTITY.MY_STATE, myState);
  }
  if (groupStates) {
    const stateService: StateService = StateService.getInstance();
    console.time('calculateUMI');
    const result = await stateService.calculateUMI(groupStates);
    console.timeEnd('calculateUMI');

    if (result.length) {
      console.time(`result.length ${result.length}`);
      await groupStateDao.bulkUpdate(result);
      console.timeEnd(`result.length ${result.length}`);

      notificationCenter.emitEntityUpdate(ENTITY.GROUP_STATE, result);
    }
  }
}

export async function handlePartialData(state: Partial<State>[]) {
  if (state.length === 0) {
    return;
  }
  const { myState, groupStates } = await getPartialStates(state);
  await operateDaoAndDoNotification(myState, groupStates);
}

export async function handleGroupChange(groups?: Group[]) {
  if (!groups || !groups.length) {
    mainLogger.info('[State Service] Invalid group change trigger');
    return;
  }
  const groupStates = _.map(groups, (group: Group) => {
    if (!group.post_cursor && !group.drp_post_cursor) {
      return;
    }
    const groupState: GroupState = {
      id: group.id,
      group_post_cursor: group.post_cursor,
      group_post_drp_cursor: group.drp_post_cursor,
      trigger_ids: group.trigger_ids,
    } as GroupState;
    return groupState;
  });
  await operateDaoAndDoNotification(undefined, _.compact(groupStates));
}
