import { service, mainLogger } from 'sdk';
import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import { StateService } from 'sdk/module/state';
import { ProfileService } from 'sdk/module/profile';
import { ProgressService } from 'sdk/module/progress';
import { GroupService } from 'sdk/module/group';
import { ENTITY_NAME, HANDLER_TYPE, GLOBAL_KEYS } from './constants';
import { PersonService } from 'sdk/module/person';
import { PermissionService } from 'sdk/module/permission';
import { PresenceService } from 'sdk/module/presence';
import { GroupConfigService } from 'sdk/module/groupConfig';
const { ENTITY } = service;
import { CompanyService } from 'sdk/module/company';

const CACHE_COUNT = 1000;

const ENTITY_SETTING = {
  [ENTITY_NAME.GROUP]: {
    event: [
      ENTITY.FAVORITE_GROUPS,
      ENTITY.TEAM_GROUPS,
      ENTITY.PEOPLE_GROUPS,
      ENTITY.GROUP,
    ],
    service: () => {
      return {
        getById: async (id: number) => {
          try {
            return await GroupService.getInstance().getById(id);
          } catch (err) {
            mainLogger.tags('Entity Config').log(`get group ${id} fail:`, err);
            return null;
          }
        },
      };
    },
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PERSON]: {
    event: [ENTITY.PERSON],
    service: () => PersonService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.GROUP_STATE]: {
    event: [ENTITY.GROUP_STATE],
    service: () => StateService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.MY_STATE]: {
    event: [ENTITY.MY_STATE],
    service: () => StateService.getInstance(),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.FILE_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.TASK_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.EVENT_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.LINK_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.NOTE_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.CODE_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.CONFERENCE_ITEM]: {
    event: [ENTITY.ITEM],
    service: () => ItemService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.POST]: {
    event: [`${ENTITY.POST}.*`],
    service: () => PostService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.DISCONTINUOUS_POST]: {
    event: [ENTITY.DISCONTINUOUS_POST],
    service: () => PostService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PRESENCE]: {
    event: [ENTITY.PRESENCE],
    service: () => PresenceService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.COMPANY]: {
    event: [ENTITY.COMPANY],
    service: () => CompanyService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PROGRESS]: {
    event: [ENTITY.PROGRESS],
    service: () => {
      return {
        getById: (id: number) =>
          (<ProgressService>ProgressService.getInstance()).getByIdSync(id),
      };
    },
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PROFILE]: {
    event: [ENTITY.PROFILE],
    service: () => ProfileService.getInstance(),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },

  [ENTITY_NAME.GROUP_CONFIG]: {
    event: [ENTITY.GROUP_CONFIG],
    service: () => GroupConfigService.getInstance(),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.USER_PERMISSION]: {
    event: [ENTITY.USER_PERMISSION],
    service: () => PermissionService.getInstance(),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },
};

const GLOBAL_VALUES = {
  [GLOBAL_KEYS.CURRENT_CONVERSATION_ID]: 0,
  [GLOBAL_KEYS.CURRENT_USER_ID]: 0,
  [GLOBAL_KEYS.CURRENT_COMPANY_ID]: 0,
  [GLOBAL_KEYS.STATIC_HTTP_SERVER]: '',
  [GLOBAL_KEYS.IS_LEFT_NAV_OPEN]: false,
  [GLOBAL_KEYS.NETWORK]: 'online',
  [GLOBAL_KEYS.WINDOW_FOCUS]: true,
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_FAVORITE_IDS]: [] as number[],
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_GROUP_IDS]: [] as number[],
  [GLOBAL_KEYS.GROUP_QUERY_TYPE_TEAM_IDS]: [] as number[],
  [GLOBAL_KEYS.UNREAD_TOGGLE_ON]: false,
  [GLOBAL_KEYS.ELECTRON_APP_VERSION]: '',
  [GLOBAL_KEYS.ELECTRON_VERSION]: '',
  [GLOBAL_KEYS.IS_SHOW_ABOUT_DIALOG]: false,
  [GLOBAL_KEYS.SHOULD_SHOW_UMI]: true,
  [GLOBAL_KEYS.JUMP_TO_POST_ID]: 0,
  [GLOBAL_KEYS.CURRENT_POST_LIST_TYPE]: '',
  [GLOBAL_KEYS.IS_SHOW_MEMBER_LIST_HEADER_SHADOW]: false,
  [GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS]: [] as number[],
  [GLOBAL_KEYS.TOTAL_UNREAD]: {},
  [GLOBAL_KEYS.FAVORITE_UNREAD]: {},
  [GLOBAL_KEYS.DIRECT_MESSAGE_UNREAD]: {},
  [GLOBAL_KEYS.TEAM_UNREAD]: {},
};

export { ENTITY_SETTING, GLOBAL_VALUES };
