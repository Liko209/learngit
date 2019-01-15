/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-14 16:34:09
 * Copyright © RingCentral. All rights reserved.
 */

import { TypeDictionary } from 'sdk/utils';

enum RIGHT_RAIL_ITEM_TYPE {
  PIN_POSTS,
  NOT_IMAGE_FILES,
  IMAGE_FILES,
  TASKS,
  NOTES,
  EVENTS,
  LINKS,
  INTEGRATIONS,
}

const RightRailItemTypeIdMap = {
  [RIGHT_RAIL_ITEM_TYPE.PIN_POSTS]: TypeDictionary.TYPE_ID_POST,
  [RIGHT_RAIL_ITEM_TYPE.IMAGE_FILES]: TypeDictionary.TYPE_ID_FILE,
  [RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES]: TypeDictionary.TYPE_ID_FILE,
  [RIGHT_RAIL_ITEM_TYPE.TASKS]: TypeDictionary.TYPE_ID_TASK,
  [RIGHT_RAIL_ITEM_TYPE.NOTES]: TypeDictionary.TYPE_ID_PAGE,
  [RIGHT_RAIL_ITEM_TYPE.EVENTS]: TypeDictionary.TYPE_ID_EVENT,
  [RIGHT_RAIL_ITEM_TYPE.LINKS]: TypeDictionary.TYPE_ID_LINK,
};

export { RIGHT_RAIL_ITEM_TYPE, RightRailItemTypeIdMap };
