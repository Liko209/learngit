enum ENTITY_NAME  {
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

export {
  ENTITY_NAME,
  HANDLER_TYPE,
};
