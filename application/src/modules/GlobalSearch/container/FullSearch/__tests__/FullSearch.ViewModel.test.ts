/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-19 10:46:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container, Jupiter } from 'framework';
import { GlobalSearchService } from '@/modules/GlobalSearch/service';
import { GlobalSearchStore } from '@/modules/GlobalSearch/store';
import { config } from '@/modules/GlobalSearch/module.config';
import { FullSearchViewModel } from '../FullSearch.ViewModel';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

const globalSearchService = container.get(GlobalSearchService);
const globalSearchStore = container.get(GlobalSearchStore);
const fullSearchVM = new FullSearchViewModel();

describe('FullSearch.ViewModel', () => {
  it('jumpToConversationCallback', () => {
    globalSearchService.closeGlobalSearch = jest.fn();
    globalSearchStore.clearSearchKey = jest.fn();
    globalSearchStore.open = true;
    fullSearchVM.jumpToConversationCallback();
    expect(globalSearchService.closeGlobalSearch).toHaveBeenCalled();
    expect(globalSearchStore.clearSearchKey).toHaveBeenCalled();
  });
});
