enum ENTITY_NAME {
  'GROUP' = 'group',
  'PERSON' = 'person',
  'GROUP_STATE' = 'groupState',
  'MY_STATE' = 'myState',
  'ITEM' = 'item',
  'POST' = 'post',
  'PRESENCE' = 'presence',
  'COMPANY' = 'company',
  'PROFILE' = 'profile',
  'POST_SENT_STATUS' = 'postSendStatus',
  'GLOBAL' = 'global',
}

enum HANDLER_TYPE {
  MULTI_ENTITY,
  SINGLE_ENTITY,
}

enum GLOBAL_KEYS {
  APP_VERSION = 'APP_VERSION',
  ELECTRON_VERSION = 'ELECTRON_VERSION',
  IS_SHOW_ABOUT_DIALOG = 'IS_SHOW_ABOUT_DIALOG',
  WINDOW_FOCUS = 'WINDOW_FOCUS',
  NETWORK = 'NETWORK',
  IS_SHOW_CREATE_TEAM_DIALOG = 'IS_SHOW_CREATE_TEAM_DIALOG',
  IS_LEFT_NAV_OPEN = 'IS_LEFT_NAV_OPEN',
  CURRENT_USER_ID = 'CURRENT_USER_ID',
  CURRENT_COMPANY_ID = 'CURRENT_COMPANY_ID',
  STATIC_HTTP_SERVER = 'STATIC_HTTP_SERVER',
  CURRENT_CONVERSATION_ID = 'CURRENT_CONVERSATION_ID',
  APP_SHOW_GLOBAL_LOADING = 'APP_SHOW_GLOBAL_LOADING',
  APP_UMI = 'APP_UMI',
  GROUP_QUERY_TYPE_GROUP_IDS = 'GROUP_QUERY_TYPE_GROUP_IDS',
  GROUP_QUERY_TYPE_TEAM_IDS = 'GROUP_QUERY_TYPE_TEAM_IDS',
  GROUP_QUERY_TYPE_FAVORITE_IDS = 'GROUP_QUERY_TYPE_FAVORITE_IDS',
  UNREAD_TOGGLE_ON = 'UNREAD_TOGGLE_ON',
  SHOULD_SHOW_UMI = 'SHOULD_SHOW_UMI',
  JUMP_TO_POST_ID = 'JUMP_TO_POST_ID',
}

export { ENTITY_NAME, HANDLER_TYPE, GLOBAL_KEYS };
