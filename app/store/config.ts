import { service } from 'sdk';
import { ENTITY_NAME, HANDLER_TYPE } from './constants';

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
    service: [
      () => PostService.getInstance(),
      'getPostSendStatus',
    ],
    type: HANDLER_TYPE.MULTI_ENTITY,
    cacheCount: 1000,
  },
};

export {
  ENTITY_SETTING,
};
