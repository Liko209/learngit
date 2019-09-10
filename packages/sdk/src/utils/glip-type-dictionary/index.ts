/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:34
 * Copyright © RingCentral. All rights reserved.
 */
import TypeDictionary from './types';
import GlipTypeUtil, { TYPE_ID_MASK } from './util';
import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { UndefinedAble } from 'sdk/types';

interface IMessage<V> {
  [key: number]: V;
}
interface ISystemMessage {
  type: string;
  data: object[];
}

const socketKeyMap = {
  STATE: 'state',
  GROUP: 'group',
  POST: 'post',
  COMPANY: 'company',
  PERSON: 'person',
  PROFILE: 'profile',
  ACCOUNT: 'account',
  ITEM: 'item',
  SEARCH: 'search',
  LOGOUT: 'logout',
};

const socketMessageMap: IMessage<string> = {
  [TypeDictionary.TYPE_ID_STATE]: socketKeyMap.STATE,
  [TypeDictionary.TYPE_ID_GROUP]: socketKeyMap.GROUP,
  [TypeDictionary.TYPE_ID_TEAM]: socketKeyMap.GROUP,
  [TypeDictionary.TYPE_ID_POST]: socketKeyMap.POST,
  [TypeDictionary.TYPE_ID_COMPANY]: socketKeyMap.COMPANY,
  [TypeDictionary.TYPE_ID_PERSON]: socketKeyMap.PERSON,
  [TypeDictionary.TYPE_ID_PROFILE]: socketKeyMap.PROFILE,
  [TypeDictionary.TYPE_ID_ACCOUNT]: socketKeyMap.ACCOUNT,
  [TypeDictionary.TYPE_ID_TASK]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_FILE]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_PLUGIN]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_EVENT]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_LINK]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_CONFERENCE]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_MEETING]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_PAGE]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_CODE]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_INTERACTIVE_MESSAGE_ITEM]: socketKeyMap.ITEM,
  [TypeDictionary.TYPE_ID_RC_VIDEO]: socketKeyMap.ITEM,
};

function getSocketMessageKey(id: number) {
  if (GlipTypeUtil.isIntegrationType(id)) {
    return 'item';
  }
  const typeId = GlipTypeUtil.extractTypeId(id);
  return socketMessageMap[typeId];
}

function parseSocketMessage(message: string | ISystemMessage) {
  if (typeof message === 'object') {
    const { type, data } = message;
    return { [type]: data };
  }

  let parsedMsg;
  try {
    parsedMsg = JSON.parse(message);
  } catch (e) {
    return null;
  }

  if (!parsedMsg || !parsedMsg.body || !parsedMsg.body.objects) {
    return null;
  }

  const objects = parsedMsg.body.objects;
  const hint = parsedMsg.body.hint;

  let post_creator_ids: UndefinedAble<number[]>;
  if (hint && hint.post_creator_ids) {
    post_creator_ids = _.values(hint.post_creator_ids);
  }
  const result = {};

  if (parsedMsg.body.timestamp) {
    result['TIMESTAMP'] = parsedMsg.body.timestamp;
  }

  objects.forEach((arr: any[]) => {
    arr.forEach((obj: any) => {
      if (post_creator_ids) {
        obj.__trigger_ids = post_creator_ids;
      }
      if (obj.search_results) {
        result[socketKeyMap.SEARCH] = obj.search_results;
      }
      if (obj.force_logout && obj.instance_id === undefined) {
        result[socketKeyMap.LOGOUT] = obj.force_logout;
      }

      const key = getSocketMessageKey(obj._id);
      if (key) {
        result[key] = result[key] || [];
        result[key].push(obj);
      }
    });
  });
  return result;
}

function parsePresence(message: string) {
  return {
    presence: message,
  };
}
function parseTyping(message: string) {
  return {
    typing: message,
  };
}

const socketMessageParser = {
  presence_unified: parsePresence,
  message: parseSocketMessage,
  partial: parseSocketMessage,
  typing: parseTyping,
  system_message: parseSocketMessage,
};
function parseSocketData(channel: string, message: string | ISystemMessage) {
  if (socketMessageParser[channel]) {
    return socketMessageParser[channel](message);
  }
  mainLogger.log(`Jupiter has not support ${channel} channel yet`);
}
export {
  TypeDictionary,
  GlipTypeUtil,
  parseSocketMessage,
  getSocketMessageKey,
  TYPE_ID_MASK,
  parseSocketData,
};
