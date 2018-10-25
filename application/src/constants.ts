/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 18:22:53
 * Copyright © RingCentral. All rights reserved.
 */
enum CONVERSATION_TYPES {
  TEAM,
  NORMAL_GROUP,
  ME,
  SMS,
  NORMAL_ONE_TO_ONE,
}

enum POST_ITEM_TYPES {
  TASK,
  FILE,
  PLUGIN,
  EVENT,
  LINK,
  MEETING,
  PAGE,
}

export { CONVERSATION_TYPES, POST_ITEM_TYPES };
