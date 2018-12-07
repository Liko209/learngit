import { service } from 'sdk';
import { ENTITY_NAME, HANDLER_TYPE, GLOBAL_KEYS } from './constants';

const {
  PersonService,
  ItemService,
  CompanyService,
  GroupService,
  PostService,
  PresenceService,
  StateService,
  ProfileService,
  ENTITY,
} = service;

const ENTITY_SETTING = {
  [ENTITY_NAME.GROUP]: {
    event: [
      ENTITY.FAVORITE_GROUPS,
      ENTITY.TEAM_GROUPS,
      ENTITY.PEOPLE_GROUPS,
      ENTITY.GROUP,
    ],
    service: () => GroupService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.PERSON]: {
    event: [ENTITY.PERSON],
    service: () => PersonService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.GROUP_STATE]: {
    event: [ENTITY.GROUP_STATE],
    service: () => StateService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.MY_STATE]: {
    event: [ENTITY.MY_STATE],
    service: () => StateService.getInstance(),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.POST]: {
    event: [ENTITY.POST],
    service: () => PostService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.PRESENCE]: {
    event: [ENTITY.PRESENCE],
    service: () => PresenceService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.COMPANY]: {
    event: [ENTITY.COMPANY],
    service: () => CompanyService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.PROFILE]: {
    event: [ENTITY.PROFILE],
    service: () => ProfileService.getInstance(),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: 1000,
  },
  [ENTITY_NAME.POST_SENT_STATUS]: {
    event: [ENTITY.POST_SENT_STATUS],
    service: [() => PostService.getInstance(), 'getPostSendStatus'],
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
};

const GLOBAL_VALUES = {
  [GLOBAL_KEYS.CURRENT_CONVERSATION_ID]: 0,
  [GLOBAL_KEYS.CURRENT_USER_ID]: 0,
  [GLOBAL_KEYS.CURRENT_COMPANY_ID]: 0,
  [GLOBAL_KEYS.STATIC_HTTP_SERVER]: '',
  [GLOBAL_KEYS.IS_LEFT_NAV_OPEN]: false,
  [GLOBAL_KEYS.IS_SHOW_CREATE_TEAM_DIALOG]: false,
  [GLOBAL_KEYS.IS_SHOW_NEW_MESSAGE_DIALOG]: false,
  [GLOBAL_KEYS.NETWORK]: 'online',
  [GLOBAL_KEYS.WINDOW_FOCUS]: true,
  [GLOBAL_KEYS.APP_SHOW_GLOBAL_LOADING]: false,
  [GLOBAL_KEYS.APP_UMI]: 0,
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_FAVORITE_IDS]: [] as number[],
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_GROUP_IDS]: [] as number[],
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_TEAM_IDS]: [] as number[],
  [GLOBAL_KEYS.UNREAD_TOGGLE_ON]: false,
  [GLOBAL_KEYS.ELECTRON_VERSION]: '',
  [GLOBAL_KEYS.APP_VERSION]: '',
  [GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG]: false,
  [GLOBAL_KEYS.SHOULD_SHOW_UMI]: true,
  [GLOBAL_KEYS.JUMP_TO_POST_ID]: 0,
  [GLOBAL_KEYS.CURRENT_POST_LIST_TYPE]: '',
  [GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW]: false,
  [GLOBAL_KEYS.TOASTS]: [] as object[],
};

export { ENTITY_SETTING, GLOBAL_VALUES };
