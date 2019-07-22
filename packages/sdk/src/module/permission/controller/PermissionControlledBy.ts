/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-19 13:13:15
 * Copyright © RingCentral. All rights reserved.
 */

const PERMISSION_PLATFORM = {
  SPLIT: 'SPLIT',
  LD: 'LD',
};

const PERMISSION_CONTROLLED_BY = {
  JUPITER_SEND_NEW_MESSAGE: PERMISSION_PLATFORM.SPLIT,
  JUPITER_CREATE_TEAM: PERMISSION_PLATFORM.LD,
  JUPITER_CAN_SAVE_LOG: PERMISSION_PLATFORM.LD,
  JUPITER_CAN_UPLOAD_LOG: PERMISSION_PLATFORM.LD,
  JUPITER_SEARCH_SUPPORT_BY_SOUNDEX: PERMISSION_PLATFORM.LD,
  JUPITER_CAN_USE_TELEPHONY: PERMISSION_PLATFORM.LD,
  CAN_SHOW_NOTE: PERMISSION_PLATFORM.LD,
  LEFT_RAIL_MAX_COUNT: PERMISSION_PLATFORM.LD,
  CAN_MENTION_TEAM: PERMISSION_PLATFORM.LD,
};

export { PERMISSION_CONTROLLED_BY, PERMISSION_PLATFORM };
