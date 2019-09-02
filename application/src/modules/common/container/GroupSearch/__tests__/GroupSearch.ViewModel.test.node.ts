/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-26 08:56:29
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupSearchViewModel } from '../GroupSearch.ViewModel';
import { testable, test } from 'shield';
import { SearchService } from 'sdk/module/search';
import { mockService } from 'shield/sdk/mockService';

describe('GroupSearch.ViewModel', () => {
  @testable
  class searchGroups {
    @test('should get result from searchService when searchGroups() called')
    @mockService.resolve(SearchService, 'doFuzzySearchAllGroups', {
      sortableModels: [{ id: 1 }],
    })
    async t1() {
      const groupSearchViewModel = new GroupSearchViewModel({
        searchFunc: SearchService.doFuzzySearchAllGroups,
      });
      groupSearchViewModel.searchGroups('key');
      setTimeout(() => {
        expect(groupSearchViewModel.size).toBe(1);
        expect(groupSearchViewModel.list).toEqual([1]);
      });
    }
  }
});
