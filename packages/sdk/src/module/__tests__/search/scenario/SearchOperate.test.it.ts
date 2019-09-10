/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-27 11:10:56
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { jit } from 'shield/sdk/SdkItFramework';
import { SearchService } from 'sdk/module/search';
import { Scenario_SearchAllGroup_myGroupOnly } from './Scenario_SearchAllGroup_myGroupOnly';
import { Scenario_SearchAllGroup_all } from './Scenario_SearchAllGroup_all';
import { Scenario_Search_Persons_Groups_all } from './Scenario_Search_Persons_Groups_all';

jit('Search Service Test', context => {
  let searchService: SearchService;
  const { helper, sdk, template } = context;
  beforeAll(async () => {
    helper.useInitialData(template.STANDARD);
    await sdk.setup();
    searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
  });

  describe('doFuzzySearchAllGroups ', () => {
    it('Scenario_SearchAllGroup_myGroupOnly', async () => {
      const result = await searchService.doFuzzySearchAllGroups(
        Scenario_SearchAllGroup_myGroupOnly.input.searchKey,
        Scenario_SearchAllGroup_myGroupOnly.input.option,
      );
      expect(result).toEqual(Scenario_SearchAllGroup_myGroupOnly.expectResult);
    });

    it('Scenario_SearchAllGroup_all', async () => {
      const result = await searchService.doFuzzySearchAllGroups(
        Scenario_SearchAllGroup_all.input.searchKey,
        Scenario_SearchAllGroup_all.input.option,
      );
      expect(result).toEqual(Scenario_SearchAllGroup_all.expectResult);
    });
  });

  describe('doFuzzySearchPersonsAndGroups', () => {
    it('Scenario_Search_Persons_Groups_all', async () => {
      const result = await searchService.doFuzzySearchPersonsAndGroups(
        Scenario_Search_Persons_Groups_all.input.searchKey,
        Scenario_Search_Persons_Groups_all.input.personOption,
        Scenario_Search_Persons_Groups_all.input.groupOption,
      );
      expect(result).toEqual(Scenario_Search_Persons_Groups_all.expectResult);
    });
  });

  describe('doFuzzySearchAllGroups ', () => {});
});
