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
jest.mock('../../../../../../utils/i18nT');
import i18nT from '../../../../../../utils/i18nT';

import { SEARCH_SCOPE, SEARCH_VIEW, TAB_TYPE } from '../types';
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
    jest.resetAllMocks();
  });
  describe('onClick() [JPT-1557]', () => {
    it('should be switch full search and set search scope', () => {
      const scope = SEARCH_SCOPE.GLOBAL;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'displayName',
      });
      jest
        .spyOn(contentItemViewModel, 'addRecentRecord')
        .mockImplementation(() => {});

      contentItemViewModel.onClick();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
      expect(globalSearchStore.searchScope).toBe(scope);
      expect(contentItemViewModel.addRecentRecord).toHaveBeenCalled();
    });
  });

  describe('contentText() [JPT-1552]', () => {
    it('if scope is conversation should be return search key in this conversation', () => {
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      const scope = SEARCH_SCOPE.GLOBAL;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'aa',
      });
      expect(contentItemViewModel.contentText).toBe('aa');
    });
    it('if scope is global should be return search key ', () => {
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      const scope = SEARCH_SCOPE.CONVERSATION;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'aa',
      });
      expect(contentItemViewModel.contentText).toBe('aa in this conversation');
    });
  });
});
