/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-08 13:59:19
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { config } from '../../../module.config';
import storeManager from '@/store/base/StoreManager';
import { GlobalSearchStore } from '../../../store';
import { SearchService } from 'sdk/module/search';
import { ENTITY_NAME } from '@/store/constants';
import { TAB_TYPE } from '../types';

jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');

import { ListSearchResultViewModel } from '../ListSearchResult.ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const mockGroupEntity = {
  displayName: 'Socket001',
  entity: {
    created_at: 1551771526012,
    creator_id: 32771,
    version: 70674976604160,
    model_size: 0,
    is_new: false,
  },
  firstSortKey: 0,
  id: 1,
  secondSortKey: 'socket001',
};

const mockTeamsEntity = {
  ...mockGroupEntity,
  id: 2,
};

const mockPeopleEntity = {
  ...mockGroupEntity,
  id: 2,
};

const groupService = {
  doFuzzySearchGroups() {
    return { terms: [], sortableModels: [mockGroupEntity] };
  },
  doFuzzySearchTeams() {
    return { terms: [], sortableModels: [mockTeamsEntity] };
  },
};

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('ListSearchResultViewModel', () => {
  let searchService: SearchService;
  let listSearchResultViewModel: ListSearchResultViewModel;
  let globalSearchStore: GlobalSearchStore;

  function setUp() {
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [mockPeopleEntity] };
    });
    ServiceLoader.getInstance = jest.fn((type: string) => {
      if (type === ServiceConfig.GROUP_SERVICE) {
        return groupService;
      }
      if (type === ServiceConfig.SEARCH_SERVICE) {
        return searchService;
      }
      return null;
    });
  }

  beforeEach(() => {
    container.snapshot();
    clearMocks();
    setUp();
    listSearchResultViewModel = new ListSearchResultViewModel();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });

  it('get currentTab', () => {
    globalSearchStore.setCurrentTab(TAB_TYPE.PEOPLE);
    expect(listSearchResultViewModel.currentTab).toBe(TAB_TYPE.PEOPLE);
  });

  describe('search', () => {
    it('If fetch return is null, search should empty array', async (done: jest.DoneCallback) => {
      listSearchResultViewModel.fetch = jest.fn().mockReturnValue(null);
      expect(await listSearchResultViewModel.search(TAB_TYPE.GROUPS)).toEqual(
        [],
      );
      done();
    });

    it('search groups: returns ids and update store', async (done: jest.DoneCallback) => {
      const store = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
      jest.spyOn(store, 'batchSet');
      const result = await listSearchResultViewModel.search(TAB_TYPE.GROUPS);
      expect(result).toContain(mockGroupEntity.id);
      expect(store.batchSet).toHaveBeenCalledWith(
        [mockGroupEntity.entity],
        true,
      );
      done();
    });

    it('search teams: returns ids and update store', async (done: jest.DoneCallback) => {
      const store = storeManager.getEntityMapStore(ENTITY_NAME.GROUP);
      jest.spyOn(store, 'batchSet');
      const result = await listSearchResultViewModel.search(TAB_TYPE.TEAM);
      expect(result).toContain(mockTeamsEntity.id);
      expect(store.batchSet).toHaveBeenCalledWith(
        [mockTeamsEntity.entity],
        true,
      );
      done();
    });

    it('search people: returns ids and update store', async (done: jest.DoneCallback) => {
      const store = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
      jest.spyOn(store, 'batchSet');
      const result = await listSearchResultViewModel.search(TAB_TYPE.PEOPLE);
      expect(result).toContain(mockPeopleEntity.id);
      expect(store.batchSet).toHaveBeenCalledWith(
        [mockPeopleEntity.entity],
        true,
      );
      done();
    });
  });
});
