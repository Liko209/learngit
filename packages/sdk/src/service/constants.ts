/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-09 15:32:58
 * Copyright © RingCentral. All rights reserved
*/
enum GROUP_QUERY_TYPE {
  ALL = 'all',
  GROUP = 'group',
  TEAM = 'team',
  FAVORITE = 'favorite',
}

enum EVENT_TYPES {
  'REPLACE' = 'replace',
  'PUT' = 'put',
  'UPDATE' = 'update',
  'DELETE' = 'delete',
  'REPLACE_ALL' = 'replaceAll',
  'RELOAD' = 'reload',
  'RESET' = 'reset',
  // LOGIN: 'login',
  // LOGOUT: 'logout',
  // INDEX_EXIST: 'fetchIndexDataExist',
  // INDEX_DONE: 'fetchIndexDataDone',
  // INDEX_ERROR: 'fetchIndexDataError',
}

enum PERMISSION_ENUM {
  TEAM_POST = 1,
  TEAM_ADD_MEMBER = 2,
  TEAM_ADD_INTEGRATIONS = 4,
  TEAM_PIN_POST = 8,
  TEAM_ADMIN = 16,
}

enum POST_STATUS {
  SUCCESS,
  FAIL,
  INPROGRESS,
}

enum PRESENCE {
  NOTREADY = 'NotReady',
  UNAVAILABLE = 'Unavailable',
  AVAILABLE = 'Available',
  ONCALL = 'OnCall',
  DND = 'DND',
  INMEETING = 'InMeeting',
}

const SHOULD_UPDATE_NETWORK_TOKEN = 'should_update_network_token';
const UMI_METRICS = [
  'group_post_drp_cursor',
  'group_post_cursor',
  'post_cursor',
  'unread_deactivated_count',
];

export {
  GROUP_QUERY_TYPE,
  EVENT_TYPES,
  PERMISSION_ENUM,
  SHOULD_UPDATE_NETWORK_TOKEN,
  POST_STATUS,
  UMI_METRICS,
  PRESENCE,
};
