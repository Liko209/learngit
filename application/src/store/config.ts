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
import { ModelCreator } from './utils/ModelCreator';
import { IdModel } from 'sdk/framework/model';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PhoneNumberService } from 'sdk/module/phoneNumber';

const CACHE_COUNT = 1000;
const PHONE_NUMBER_CACHE_COUNT = 100;

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
            return await ServiceLoader.getInstance<GroupService>(
              ServiceConfig.GROUP_SERVICE,
            ).getById(id);
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
    service: () =>
      ServiceLoader.getInstance<PersonService>(ServiceConfig.PERSON_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.GROUP_STATE]: {
    event: [ENTITY.GROUP_STATE],
    service: () =>
      ServiceLoader.getInstance<StateService>(ServiceConfig.STATE_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.MY_STATE]: {
    event: [ENTITY.MY_STATE],
    service: () =>
      ServiceLoader.getInstance<StateService>(ServiceConfig.STATE_SERVICE),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.ITEM]: {
    event: [`${ENTITY.ITEM}.*.*`],
    service: () =>
      ServiceLoader.getInstance<ItemService>(ServiceConfig.ITEM_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
    modelCreator: (model: IdModel) => {
      return ModelCreator.createItemModel(model);
    },
  },
  [ENTITY_NAME.POST]: {
    event: [`${ENTITY.POST}.*`],
    service: () =>
      ServiceLoader.getInstance<PostService>(ServiceConfig.POST_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.DISCONTINUOUS_POST]: {
    event: [ENTITY.DISCONTINUOUS_POST],
    service: () =>
      ServiceLoader.getInstance<PostService>(ServiceConfig.POST_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PRESENCE]: {
    event: [ENTITY.PRESENCE],
    service: () =>
      ServiceLoader.getInstance<PresenceService>(
        ServiceConfig.PRESENCE_SERVICE,
      ),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.COMPANY]: {
    event: [ENTITY.COMPANY],
    service: () =>
      ServiceLoader.getInstance<CompanyService>(ServiceConfig.COMPANY_SERVICE),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PROGRESS]: {
    event: [ENTITY.PROGRESS],
    service: () => {
      return {
        getById: (id: number) =>
          ServiceLoader.getInstance<ProgressService>(
            ServiceConfig.PROGRESS_SERVICE,
          ).getByIdSync(id),
      };
    },
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PROFILE]: {
    event: [ENTITY.PROFILE],
    service: () =>
      ServiceLoader.getInstance<ProfileService>(ServiceConfig.PROFILE_SERVICE),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },

  [ENTITY_NAME.GROUP_CONFIG]: {
    event: [ENTITY.GROUP_CONFIG],
    service: () =>
      ServiceLoader.getInstance<GroupConfigService>(
        ServiceConfig.GROUP_CONFIG_SERVICE,
      ),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.USER_PERMISSION]: {
    event: [ENTITY.USER_PERMISSION],
    service: () =>
      ServiceLoader.getInstance<PermissionService>(
        ServiceConfig.PERMISSION_SERVICE,
      ),
    type: HANDLER_TYPE.SINGLE_ENTITY,
    cacheCount: CACHE_COUNT,
  },
  [ENTITY_NAME.PHONE_NUMBER]: {
    event: [ENTITY.PHONE_NUMBER],
    service: () =>
      ServiceLoader.getInstance<PhoneNumberService>(
        ServiceConfig.PHONE_NUMBER_SERVICE,
      ),
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: PHONE_NUMBER_CACHE_COUNT,
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
  [GLOBAL_KEYS.CURRENT_SETTING_LIST_TYPE]: '',
};

export { ENTITY_SETTING, GLOBAL_VALUES };
