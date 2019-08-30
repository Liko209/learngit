/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:17:48
 * Copyright © RingCentral. All rights reserved.
 */

enum UserPermissionType {
  JUPITER_CREATE_TEAM = 'JUPITER_CREATE_TEAM',
  JUPITER_SEND_NEW_MESSAGE = 'JUPITER_SEND_NEW_MESSAGE',
  JUPITER_CAN_SAVE_LOG = 'JUPITER_CAN_SAVE_LOG',
  JUPITER_CAN_UPLOAD_LOG = 'JUPITER_CAN_UPLOAD_LOG',
  JUPITER_CAN_SHOW_IMAGE_DIALOG = 'JUPITER_CAN_SHOW_IMAGE_DIALOG',
  JUPITER_CAN_USE_TELEPHONY = 'JUPITER_CAN_USE_TELEPHONY',
  JUPITER_SEARCH_SUPPORT_BY_SOUNDEX = 'JUPITER_SEARCH_SUPPORT_BY_SOUNDEX',
  ZIP_LOG_AUTO_UPLOAD_BETA = 'ZIP_LOG_AUTO_UPLOAD_BETA',
  CAN_SHOW_NOTE = 'CAN_SHOW_NOTE',
  LEFT_RAIL_MAX_COUNT = 'LEFT_RAIL_MAX_COUNT',
  CAN_MENTION_TEAM = 'CAN_MENTION_TEAM',
  CAN_SHOW_ALL_GROUP = 'CAN_SHOW_ALL_GROUP',
  CAN_USE_VIDEO_CALL = 'CAN_USE_VIDEO_CALL',
  SENTRY_ERROR_FILTER = 'SENTRY_ERROR_FILTER',
}

export type FeatureFlagType = string | number | Array<any>;
export default UserPermissionType;
