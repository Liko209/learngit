/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-18 14:17:28
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store/constants';
import { ENTITY } from 'sdk/service/eventKey';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import GroupService from 'sdk/module/group';
import { PersonService } from 'sdk/module/person';

import { SearchItemTypes } from '../InstantSearch/types';

const ENTITY_MAP = {
  [SearchItemTypes.PEOPLE]: {
    name: ENTITY_NAME.PERSON,
    event: ENTITY.PERSON,
    getByIds: async (ids: number[]) =>
      ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      ).getPersonsByIds(ids),
  },
  [SearchItemTypes.GROUP]: {
    name: ENTITY_NAME.GROUP,
    event: ENTITY.GROUP,
    getByIds: async (ids: number[]) =>
      ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      ).getGroupsByIds(ids),
  },
  [SearchItemTypes.TEAM]: {
    name: ENTITY_NAME.GROUP,
    event: ENTITY.GROUP,
    getByIds: async (ids: number[]) =>
      ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      ).getGroupsByIds(ids),
  },
};

const INITIAL_DATA_COUNT = 30;
const MAX_COUNT = 12;
const ITEM_HEIGHT = 48;
const FULLSCREEN_WIDTH = 640;
const LOADING_DELAY = 150;
const LOAD_MORE_COUNT = 25;
const MAX_HEIGHT = 480;

export {
  ENTITY_MAP,
  INITIAL_DATA_COUNT,
  MAX_COUNT,
  ITEM_HEIGHT,
  FULLSCREEN_WIDTH,
  LOADING_DELAY,
  LOAD_MORE_COUNT,
  MAX_HEIGHT,
};
