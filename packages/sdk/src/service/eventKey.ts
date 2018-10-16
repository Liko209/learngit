/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-04-16 17:23:21
 * Copyright © RingCentral. All rights reserved.
 */

// const EVENT_KEYS = {
//   COMPANY: 'COMPANY',
//   GROUP: 'GROUP',
//   ITEM: 'ITEM',
//   PERSON: 'PERSON',
//   POST: 'POST',
//   PRESENCE: 'PRESENCE',
//   PROFILE: 'PROFILE',
//   STATE: 'STATE',
// };

enum SOCKET {
  COMPANY = 'SOCKET.COMPANY',
  GROUP = 'SOCKET.GROUP',
  PARTIAL_GROUP = 'SOCKET.PARTIAL.GROUP',
  ITEM = 'SOCKET.ITEM',
  PERSON = 'SOCKET.PERSON',
  POST = 'SOCKET.POST',
  PRESENCE = 'SOCKET.PRESENCE',
  PROFILE = 'SOCKET.PROFILE',
  STATE = 'SOCKET.STATE',
  PARTIAL_STATE = 'SOCKET.PARTIAL.STATE',
  NETWORK_CHANGE = 'SOCKET.NETWORK_CHANGE',
  SEARCH = 'SOCKET.SEARCH',
  SEARCH_SCROLL = 'SOCKET.SEARCH_SCROLL',
  RECONNECT = 'SOCKET.RECONNECT',
  CLIENT_CONFIG = 'SOCKET.CLIENT_CONFIG',
}

const ENTITY = {
  COMPANY: 'ENTITY.COMPANY',
  GROUP: 'ENTITY.GROUP',
  ITEM: 'ENTITY.ITEM',
  PERSON: 'ENTITY.PERSON',
  POST: 'ENTITY.POST',
  POST_OLD_NEW: 'ENTITY.POST_OLD_NEW',
  POST_SENT_STATUS: 'ENTITY.POST_SENT_STATUS',
  PRESENCE: 'ENTITY.PRESENCE',
  PROFILE: 'ENTITY.PROFILE',
  // STATE: 'ENTITY.STATE',
  MY_STATE: 'ENTITY.MY_STATE',
  GROUP_STATE: 'ENTITY.GROUP_STATE',
  FAVORITE_GROUPS: 'ENTITY.FAVORITE_GROUPS',
  TEAM_GROUPS: 'ENTITY.TEAM_GROUPS',
  PEOPLE_GROUPS: 'ENTITY.PEOPLE_GROUPS',
};

const CONFIG = {
  LAST_INDEX_TIMESTAMP: 'CONFIG.LAST_INDEX_TIMESTAMP',
  SOCKET_SERVER_HOST: 'CONFIG.SOCKET_SERVER_HOST',
};

const SERVICE = {
  LOGIN: 'AUTH.LOGIN',
  LOGOUT: 'AUTH.LOGOUT',
  FETCH_INDEX_DATA_EXIST: 'SYNC.FETCH_INDEX_DATA_EXIST',
  FETCH_INDEX_DATA_DONE: 'SYNC.FETCH_INDEX_DATA_DONE',
  FETCH_INDEX_DATA_ERROR: 'SYNC.FETCH_INDEX_DATA_ERROR',
  PROFILE_FAVORITE: 'PROFILE/FAVORITE',
  PROFILE_HIDDEN_GROUP: 'PROFILE/HIDDEN_GROUP',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_END: 'SEARCH_END',
  DO_SIGN_OUT: 'DO_SIGN_OUT',
  GROUP_CURSOR: 'GROUP_CURSOR',
  SOCKET_STATE_CHANGE: 'SERVICE.SOCKET_STATE_CHANGE',
  GATE_WAY_504_BEGIN: 'SERVICE.GATE_WAY_504_BEGIN',
  GATE_WAY_504_END: 'SERVICE.GATE_WAY_504_END',
};

const DOCUMENT = {
  VISIBILITYCHANGE: 'DOCUMENT.VISIBILITY_STATE',
};
const WINDOW = {
  ONLINE: 'WINDOW.ONLINE',
  BLUR: 'WINDOW.BLUR',
};

export { SOCKET, ENTITY, CONFIG, SERVICE, DOCUMENT, WINDOW };
