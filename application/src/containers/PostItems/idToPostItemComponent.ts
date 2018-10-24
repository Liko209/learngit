import { GlipTypeUtil } from 'sdk/utils';
import { POST_ITEM_TYPES } from '@/constants';
import { Event } from './event';

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
  [POST_ITEM_TYPES.EVENT]: Event,
};

function idToPostItemComponent(id: number) {
  const typeId = GlipTypeUtil.extractTypeId(id);
  return typeToPostItemComponent[idToPostItemType[typeId]];
}

export default idToPostItemComponent;
