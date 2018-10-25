/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-10-25 10:09:11
 * Copyright © RingCentral. All rights reserved.
 */
import { GlipTypeUtil } from 'sdk/utils';
import { POST_ITEM_TYPES } from '@/constants';

const idToPostItemType = {
  8: POST_ITEM_TYPES.PLUGIN,
  9: POST_ITEM_TYPES.TASK,
  10: POST_ITEM_TYPES.FILE,
  14: POST_ITEM_TYPES.EVENT,
  17: POST_ITEM_TYPES.LINK,
  18: POST_ITEM_TYPES.PAGE,
  20: POST_ITEM_TYPES.MEETING,
};

const typeToPostItemComponent = {
  [POST_ITEM_TYPES.PLUGIN]: () => {},
  [POST_ITEM_TYPES.TASK]: () => {},
  [POST_ITEM_TYPES.FILE]: () => {},
  [POST_ITEM_TYPES.EVENT]: () => {},
  [POST_ITEM_TYPES.LINK]: () => {},
  [POST_ITEM_TYPES.PAGE]: () => {},
  [POST_ITEM_TYPES.MEETING]: () => {},
};

function idToPostItemComponent(id: number) {
  const typeId = GlipTypeUtil.extractTypeId(id);
  return typeToPostItemComponent[idToPostItemType[typeId]];
}

export default idToPostItemComponent;
