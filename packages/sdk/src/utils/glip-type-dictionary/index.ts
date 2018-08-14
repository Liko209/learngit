/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:34
 * Copyright © RingCentral. All rights reserved.
 */

import TypeDictionary from './types';
import GlipTypeUtil from './util';

interface IMessage<V> {
  [key: number]: V;
}
const socketMessageMap: IMessage<string> = {
  [TypeDictionary.TYPE_ID_STATE]: 'state',
  [TypeDictionary.TYPE_ID_GROUP]: 'group',
  [TypeDictionary.TYPE_ID_TEAM]: 'group',
  [TypeDictionary.TYPE_ID_POST]: 'post',
  [TypeDictionary.TYPE_ID_COMPANY]: 'company',
  [TypeDictionary.TYPE_ID_PERSON]: 'person',
  [TypeDictionary.TYPE_ID_PROFILE]: 'profile',
  [TypeDictionary.TYPE_ID_ACCOUNT]: 'account',
  [TypeDictionary.TYPE_ID_TASK]: 'item',
  [TypeDictionary.TYPE_ID_FILE]: 'item',
  [TypeDictionary.TYPE_ID_PLUGIN]: 'item',
  [TypeDictionary.TYPE_ID_TASK]: 'item',
  [TypeDictionary.TYPE_ID_EVENT]: 'item',
  [TypeDictionary.TYPE_ID_LINK]: 'item',
  [TypeDictionary.TYPE_ID_MEETING]: 'item',
  [TypeDictionary.TYPE_ID_PAGE]: 'item',
};

function parseSocketMessage(message: string) {
  const {
    body: { objects },
  } = JSON.parse(message);
  const result = {};
  objects.forEach((arr: any[]) => {
    arr.forEach((obj) => {
      if (obj.search_results) {
        result['search'] = obj.search_results;
      }
      const objTypeId = GlipTypeUtil.extractTypeId(obj._id);
      if (socketMessageMap[objTypeId]) {
        const key = socketMessageMap[objTypeId];
        result[key] = result[key] || [];
        result[key].push(obj);
      }
    });
  });
  return result;
}

export { TypeDictionary, GlipTypeUtil, parseSocketMessage };
