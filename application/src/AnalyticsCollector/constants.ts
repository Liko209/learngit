import { CONVERSATION_TYPES } from '@/constants';

enum PHONE_TAB {
  VOICEMAIL = 'voicemail',
  CALL_HISTORY = 'callHistory',
}

enum PHONE_ITEM_ACTIONS {
  MESSAGE = 'Message',
  CALL = 'Call',
  BLOCK = 'Block',
  UNBLOCK = 'Unblock',
  DELETE = 'Delete',
  DOWNLOAD = 'Download',
  MARK_READ = 'Mark read',
  MARK_UNREAD = 'Mark unread',
}

enum SHORT_CUT_KEYS {
  ESCAPE = 'escape',
}

const GROUP_TYPE_DICT = {
  [CONVERSATION_TYPES.TEAM]: 'team',
  [CONVERSATION_TYPES.NORMAL_GROUP]: 'group',
  [CONVERSATION_TYPES.NORMAL_ONE_TO_ONE]: '1:1',
  [CONVERSATION_TYPES.ME]: '1:1',
};

export { PHONE_TAB, PHONE_ITEM_ACTIONS, GROUP_TYPE_DICT, SHORT_CUT_KEYS };
