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
import { MessageItemViewModel } from '../MessageItem.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { getGlobalValue, getEntity } from '@/store/utils';
jest.mock('@/store/utils');

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('GroupItemViewModel', () => {
  let messageItemViewModel: MessageItemViewModel;
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
  });
  describe('onClick() [JPT-1557]', () => {
    it('if not group id should be switch full search and scope is GLOBAL', () => {
      const searchKey = 'displayName';
      messageItemViewModel = new MessageItemViewModel({
        displayName: searchKey,
      });
      jest
        .spyOn(messageItemViewModel, 'addRecentRecord')
        .mockImplementation(() => {});

      messageItemViewModel.onClick();
      expect(globalSearchStore.groupId).toBeUndefined();
      expect(globalSearchStore.searchKey).toBe(searchKey);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
      expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.GLOBAL);
      expect(messageItemViewModel.addRecentRecord).toHaveBeenCalled();
    });
    it('if has group id should be switch full search and set scope is conversation', () => {
      const id = 1;
      const searchKey = 'displayName';
      messageItemViewModel = new MessageItemViewModel({
        displayName: searchKey,
        params: {
          groupId: id,
        },
      });
      jest
        .spyOn(messageItemViewModel, 'addRecentRecord')
        .mockImplementation(() => {});

      messageItemViewModel.onClick();
      expect(globalSearchStore.groupId).toBe(id);
      expect(globalSearchStore.searchKey).toBe(searchKey);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.currentTab).toBe(TAB_TYPE.CONTENT);
      expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.CONVERSATION);
      expect(messageItemViewModel.addRecentRecord).toHaveBeenCalled();
    });
  });

  describe('groupName', () => {
    it('if current conversation id === group id should be display in this conversation', () => {
      const id = 1;
      const conversationId = 1;
      const displayName = 'aa';
      const params = { groupId: id };
      (getEntity as jest.Mock).mockReturnValue({ id });
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      (i18nT as jest.Mock).mockReturnValue('in this conversation');

      messageItemViewModel = new MessageItemViewModel({
        displayName,
        params,
      });

      expect(messageItemViewModel.groupName).toBe(
        `${displayName} in this conversation`,
      );
    });
    it('if current conversation id !== group id should be display in group name', () => {
      const id = 1;
      const conversationId = 2;
      const displayName = 'aa';
      const groupName = 'group name';
      const params = { groupId: id };
      (getEntity as jest.Mock).mockReturnValue({ id, displayName: groupName });
      (getGlobalValue as jest.Mock).mockReturnValue(conversationId);
      (i18nT as jest.Mock).mockReturnValue('in');

      messageItemViewModel = new MessageItemViewModel({
        displayName,
        params,
      });

      expect(messageItemViewModel.groupName).toBe(
        `${displayName} in ${groupName}`,
      );
    });
    it('if not group should be show display name', () => {
      const displayName = 'aa';

      messageItemViewModel = new MessageItemViewModel({
        displayName,
      });

      expect(messageItemViewModel.groupName).toBe(displayName);
    });
  });

  describe('addRecentRecord()', () => {
    it('if has group id should be call add record with group id', () => {
      const id = 1;
      const displayName = 'aa';
      const params = { groupId: id };
      (getEntity as jest.Mock).mockReturnValue({ id });
      messageItemViewModel = new MessageItemViewModel({
        params,
        displayName,
      });
      messageItemViewModel.addRecentRecord();
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        displayName,
        { groupId: params.groupId },
      );
    });

    it('if group id is undefined should be call add record with empty object', () => {
      const displayName = 'aa';
      (getEntity as jest.Mock).mockReturnValue({});
      messageItemViewModel = new MessageItemViewModel({
        displayName,
      });
      messageItemViewModel.addRecentRecord();
      expect(searchService.addRecentSearchRecord).toHaveBeenCalledWith(
        RecentSearchTypes.SEARCH,
        displayName,
        {},
      );
    });
  });
});
