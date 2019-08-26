/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-03 10:11:57
 * Copyright © RingCentral. All rights reserved.
 */
// import { UserConfig } from 'sdk/service/account';
// import { getEntity } from '../../../../../../store/utils';
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '../../../../module.config';
import { GlobalSearchStore } from '../../../../store';
jest.mock('../../../../../../utils/i18nT');
import i18nT from '../../../../../../utils/i18nT';
import { getGlobalValue } from '@/store/utils';
jest.mock('@/store/utils');
import { SEARCH_SCOPE, SEARCH_VIEW, TAB_TYPE } from '../types';
import { ContentItemViewModel } from '../ContentItem.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { RecentSearchTypes } from 'sdk/module/search/entity';
jest.mock('sdk/module/config')

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('ContentItemViewModel', () => {
  let contentItemViewModel: ContentItemViewModel;
  let globalSearchStore: GlobalSearchStore;
  let searchService: SearchService;

  beforeEach(() => {
    container.snapshot();
    globalSearchStore = container.get(GlobalSearchStore);
    searchService = new SearchService();
    searchService.addRecentSearchRecord = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
  });
  afterEach(() => {
    container.restore();
    jest.resetAllMocks();
  });
  describe('onClick() [JPT-1557][JPT-1567]', () => {
    it('if scope is global should be switch full search and group id is undefined', () => {
      const scope = SEARCH_SCOPE.GLOBAL;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'displayName',
      });
      jest
        .spyOn(contentItemViewModel, 'addRecentRecord')
        .mockImplementation(() => {});

      contentItemViewModel.onClick();
      expect(globalSearchStore.groupId).toBeUndefined();
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
      expect(globalSearchStore.searchScope).toBe(scope);
      expect(contentItemViewModel.addRecentRecord).toHaveBeenCalled();
    });

    it('if scope is conversation should be switch full search and has group id', () => {
      const conversationId = 1;
      const scope = SEARCH_SCOPE.CONVERSATION;
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'displayName',
      });
      jest
        .spyOn(contentItemViewModel, 'addRecentRecord')
        .mockImplementation(() => {});

      contentItemViewModel.onClick();
      expect(globalSearchStore.groupId).toBe(1);
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
  });

  describe('inThisConversation', () => {
    it('if scope is global should be return search key ', async (done: jest.DoneCallback) => {
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      const scope = SEARCH_SCOPE.GLOBAL;
      contentItemViewModel = new ContentItemViewModel({
        searchScope: scope,
        displayName: 'aa',
      });
      expect(await contentItemViewModel.inThisConversation.fetch()).toBe('');
      done();
    });

    it('if scope is global should be return search key ', async (done: jest.DoneCallback) => {
      (i18nT as jest.Mock).mockReturnValue('in this conversation');
      const scope = SEARCH_SCOPE.CONVERSATION;
      contentItemViewModel = new ContentItemViewModel({
        displayName: 'aa',
        searchScope: scope,
      });
      expect(await contentItemViewModel.inThisConversation.fetch()).toBe(
        ' in this conversation',
      );
      done();
    });
  });

  describe('addRecentRecord()', () => {
    it('if scope is conversation should be call add record with group id', () => {
      const conversationId = 1;
      const displayName = 'aa';
      const scope = SEARCH_SCOPE.CONVERSATION;
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      contentItemViewModel = new ContentItemViewModel({
        displayName,
        searchScope: scope,
      });
      contentItemViewModel.addRecentRecord();
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        displayName,
        { groupId: conversationId },
      );
    });

    it('if scope is global should be call add record with empty object', () => {
      const conversationId = 1;
      const displayName = 'aa';
      const scope = SEARCH_SCOPE.GLOBAL;
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      contentItemViewModel = new ContentItemViewModel({
        displayName,
        searchScope: scope,
      });
      contentItemViewModel.addRecentRecord();
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        displayName,
        {},
      );
    });
  });
});
