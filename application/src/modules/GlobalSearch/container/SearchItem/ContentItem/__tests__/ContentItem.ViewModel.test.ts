/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-03 10:11:57
 * Copyright © RingCentral. All rights reserved.
 */
// import { UserConfig } from 'sdk/service/account';
// import { getEntity } from '../../../../../../store/utils';
import { container, Jupiter } from 'framework';
import { config } from '../../../../module.config';
import { GlobalSearchStore } from '../../../../store';

import { SEARCH_SCOPE, SEARCH_VIEW } from '../types';
import { ContentItemViewModel } from '../ContentItem.ViewModel';

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('GroupItemViewModel', () => {
  let contentItemViewModel: ContentItemViewModel;
  let globalSearchStore: GlobalSearchStore;

  beforeEach(() => {
    container.snapshot();
    globalSearchStore = container.get(GlobalSearchStore);
  });
  afterEach(() => {
    container.restore();
  });
  describe('onClick()', () => {
    it('should be switch full search and set search scope', () => {
      const scope = SEARCH_SCOPE.GLOBAL;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'displayName',
      });
      contentItemViewModel.onClick();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.searchScope).toBe(scope);
    });
  });
});
