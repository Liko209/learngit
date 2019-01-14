/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-08 19:45:24
 * Copyright © RingCentral. All rights reserved.
 */

enum RIGHT_RAIL_ITEM_TYPE {
  NOT_IMAGE_FILES,
  IMAGE_FILES,
  TASKS,
  NOTES,
  EVENTS,
  LINKS,
}

enum ITEM_SORT_KEYS {
  CREATE_TIME = 'created_at',
  NAME = 'name',
}

export { ITEM_SORT_KEYS, RIGHT_RAIL_ITEM_TYPE };
