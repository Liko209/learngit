/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:12
 * Copyright © RingCentral. All rights reserved.
 */
import { TYPE_ID_MASK, TypeDictionary } from 'sdk/utils/glip-type-dictionary';

import { STATE_KEYS } from './constants';
import { GlipState } from './types';

const FACTOR = (TYPE_ID_MASK << 1) & ~TYPE_ID_MASK;
const typeIdPool = new Map<string, number>();
const getTableCursor = (table: string) => {
  const cursor = typeIdPool.get(table) || 1;
  typeIdPool.set(table, cursor + 1);
  return cursor;
};
const genId = (table: string, typeId: number) => (getTableCursor(table) * FACTOR) | typeId;

const genGroupId = () => genId('group', TypeDictionary.TYPE_ID_GROUP);
const genTeamId = () => genId('team', TypeDictionary.TYPE_ID_TEAM);
const genCompanyId = () => genId('company', TypeDictionary.TYPE_ID_COMPANY);
const genPersonId = () => genId('person', TypeDictionary.TYPE_ID_PERSON);
const genPostId = () => genId('post', TypeDictionary.TYPE_ID_POST);
const genStateId = () => genId('state', TypeDictionary.TYPE_ID_STATE);
const genProfileId = () => genId('profile', TypeDictionary.TYPE_ID_PROFILE);

export function parseState(state: GlipState) {
  const groupStates = {};
  const groupIds = new Set<string>();

  Object.keys(state).forEach((key: string) => {
    const matches = key.match(new RegExp(`(${STATE_KEYS.join('|')}):(\\d+)`));
    if (matches) {
      const groupStateKey = matches[1];
      const groupId = matches[2];
      const value = state[key];
      if (!groupStates[groupId]) {
        groupStates[groupId] = {
          _id: Number(groupId),
        };
      }
      groupStates[groupId][groupStateKey] = value;
      groupIds.add(groupId);
      delete state[key];
      return;
    }
  });
  return Array.from(groupIds).map(id => groupStates[id]);
}

export {
  genId, genCompanyId, genGroupId, genTeamId, genPersonId, genPostId, genStateId, genProfileId
};
