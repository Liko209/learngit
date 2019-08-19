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
  TIMESTAMP = 'SOCKET.TIMESTAMP',
  CONNECT_ERROR = 'SOCKET.CONNECT_ERROR',
  ERROR = 'SOCKET.ERROR',
  TYPING = 'SOCKET.TYPING',
  LOGOUT = 'SOCKET.LOGOUT',
}

const ENTITY = {
  COMPANY: 'ENTITY.COMPANY',
  GROUP: 'ENTITY.GROUP',
  ITEM: 'ENTITY.ITEM',
  PERSON: 'ENTITY.PERSON',
  POST: 'ENTITY.POST',
  DISCONTINUOUS_POST: 'ENTITY.DISCONTINUOUS_POST',
  POST_OLD_NEW: 'ENTITY.POST_OLD_NEW',
  PRESENCE: 'ENTITY.PRESENCE',
  PROFILE: 'ENTITY.PROFILE',
  // STATE: 'ENTITY.STATE',
  MY_STATE: 'ENTITY.MY_STATE',
  GROUP_STATE: 'ENTITY.GROUPSTATE',
  FAVORITE_GROUPS: 'ENTITY.FAVORITE_GROUPS',
  TEAM_GROUPS: 'ENTITY.TEAM_GROUPS',
  PEOPLE_GROUPS: 'ENTITY.PEOPLE_GROUPS',
  PROGRESS: 'ENTITY.PROGRESS',
  GROUP_CONFIG: 'ENTITY.GROUPCONFIG',
  USER_PERMISSION: 'ENTITY.USER_PERMISSION',
  CONVERSATION_PREFERENCE: 'CONVERSATION_PREFERENCE',
  FOC_RELOAD: 'ENTITY.FOC_RELOAD',
  USER_SETTING: 'USER_SETTING',
  PHONE_NUMBER: 'ENTITY.PHONE_NUMBER',
  CALL: 'ENTITY.CALL',
  BADGE: 'ENTITY.BADGE',
  CALL_LOG: 'ENTITY.CALLLOG',
  VOICE_MAIL: 'ENTITY.VOICEMAIL',
};

const CONFIG = {
  STATIC_HTTP_SERVER: 'CONFIG.STATIC_HTTP_SERVER',
  INDEX_SOCKET_SERVER_HOST: 'CONFIG.INDEX_SOCKET_SERVER_HOST',
};

const SERVICE = {
  RC_LOGIN: 'AUTH.RC_LOGIN',
  GLIP_LOGIN: 'AUTH.GLIP_LOGIN',
  LOGOUT: 'AUTH.LOGOUT',
  START_LOADING: 'SERVICE.START_LOADING',
  STOP_LOADING: 'SERVICE.STOP_LOADING',
  RELOAD: 'SERVICE.RELOAD',
  FETCH_INDEX_DATA_EXIST: 'SYNC.FETCH_INDEX_DATA_EXIST',
  FETCH_INDEX_DATA_DONE: 'SYNC.FETCH_INDEX_DATA_DONE',
  FETCH_INDEX_DATA_ERROR: 'SYNC.FETCH_INDEX_DATA_ERROR',
  FETCH_REMAINING_DONE: 'SYNC.FETCH_REMAINING_DONE',
  PROFILE_FAVORITE: 'PROFILE/FAVORITE',
  SEARCH_SUCCESS: 'SEARCH_SUCCESS',
  SEARCH_END: 'SEARCH_END',
  DO_SIGN_OUT: 'DO_SIGN_OUT',
  GROUP_CURSOR: 'GROUP_CURSOR',
  SOCKET_STATE_CHANGE: 'SERVICE.SOCKET_STATE_CHANGE',
  STOPPING_SOCKET: 'SERVICE.STOPPING_SOCKET',
  WAKE_UP_FROM_SLEEP: 'SERVICE.WAKE_UP_FROM_SLEEP',
  GATE_WAY_504_END: 'SERVICE.GATE_WAY_504_END',
  POST_SERVICE: {
    NEW_POST_TO_GROUP: 'SERVICE.POST_SERVICE.NEW_POST_TO_GROUP',
    MARK_GROUP_HAS_MORE_ODER_AS_TRUE:
      'SERVICE.POST_SERVICE.MARK_GROUP_HAS_MORE_ODER_AS_TRUE',
  },
  ITEM_SERVICE: {
    PSEUDO_ITEM_STATUS: 'SERVICE.ITEM_SERVICE.PSEUDO_ITEM_STATUS',
  },
  PERSON_SERVICE: {
    TEAMS_REMOVED_FROM: 'SERVICE.PERSON_SERVICE.TEAMS_REMOVED_FROM',
  },
  TELEPHONY_SERVICE: {
    VOIP_CALLING: 'SERVICE.TELEPHONY_SERVICE.VOIP_CALLING',
    CALL_SWITCH: 'SERVICE.TELEPHONY_SERVICE.CALL_SWITCH',
    SIP_PROVISION_EA_UPDATED:
      'SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_EA_UPDATED',
    SIP_PROVISION_RECEIVED: 'SERVICE.TELEPHONY_SERVICE.SIP_PROVISION_RECEIVED',
  },
  RC_INFO_SERVICE: {
    REGION_UPDATED: 'SERVICE.RC_INFO_SERVICE.REGION_UPDATED',
    E911_UPDATED: 'SERVICE.RC_INFO_SERVICE.E911_UPDATED',
  },
  GROUP_TYPING: 'SERVICE.GROUP_TYPING',
};

const RC_INFO = {
  ACCOUNT_INFO: 'RC_INFO.ACCOUNT_INFO',
  CLIENT_INFO: 'RC_INFO.CLIENT_INFO',
  EXTENSION_INFO: 'RC_INFO.EXTENSION_INFO',
  ROLE_PERMISSIONS: 'RC_INFO.ROLE_PERMISSIONS',
  PHONE_DATA: 'RC_INFO.PHONE_DATA',
  SPECIAL_NUMBER_RULE: 'RC_INFO.SPECIAL_NUMBER_RULE',
  EXTENSION_PHONE_NUMBER_LIST: 'RC_INFO.EXTENSION_PHONE_NUMBER_LIST',
  EXTENSION_CALLER_ID: 'RC_INFO.EXTENSION_CALLER_ID',
  DIALING_PLAN: 'RC_INFO.DIALING_PLAN',
  RC_SERVICE_INFO: 'RC_INFO.RC_SERVICE_INFO',
  RC_REGION_INFO: 'RC_INFO.RC_REGION_INFO',
  RC_FORWARDING_NUMBERS: 'RC_INFO.RC_FORWARDING_NUMBERS',
  DEVICE_INFO: 'RC_INFO.DEVICE_INFO',
};

const DOCUMENT = {
  VISIBILITYCHANGE: 'DOCUMENT.VISIBILITY_STATE',
};
const WINDOW = {
  ONLINE: 'WINDOW.ONLINE',
  BLUR: 'WINDOW.BLUR',
  FOCUS: 'FOCUS',
};

const ENTITY_LIST = {
  GROUP_MEMBER: 'ENTITY_LIST.GROUP_MEMBER',
  CALL_LOG_LIST: 'CALL_LOG_LIST',
};

const SUBSCRIPTION = {
  MISSED_CALLS: 'SUBSCRIPTION.SUBSCRIPTION.MISSED_CALLS',
  MESSAGE_STORE: 'SUBSCRIPTION.MESSAGE_STORE',
  PRESENCE_WITH_TELEPHONY_DETAIL: 'SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL',
};

const APPLICATION = {
  NOTIFICATION_PERMISSION_CHANGE: 'APPLICATION.NOTIFICATION_PERMISSION_CHANGE',
};

export {
  SOCKET,
  ENTITY,
  CONFIG,
  SERVICE,
  DOCUMENT,
  WINDOW,
  RC_INFO,
  ENTITY_LIST,
  SUBSCRIPTION,
  APPLICATION,
};
