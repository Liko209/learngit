/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-03 12:06:51
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import GroupModel from '@/store/models/Group';

import { config } from '../../../module.config';
import { SearchViewModel } from '../Search.ViewModel';

import { GlobalSearchStore } from '../../../store';
import { goToConversationWithLoading } from '../../../../../common/goToConversation';
import { joinPublicTeam } from '../../../../../common/joinPublicTeam';

jest.mock('../../../../../common/goToConversation');
jest.mock('../../../../../common/joinPublicTeam');
const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('SearchViewModel', () => {
  let searchViewModel: SearchViewModel<any>;
  let globalSearchStore: GlobalSearchStore;

  beforeEach(() => {
    container.snapshot();
    globalSearchStore = container.get(GlobalSearchStore);
    searchViewModel = new SearchViewModel();
  });

  afterEach(() => {
    container.restore();
  });

  describe('onClear()', () => {
    it('globalSearchStore"s searchKey should be "" ', () => {
      searchViewModel.onClear();
      expect(globalSearchStore.searchKey).toBe('');
    });
  });
  describe('onClose()', () => {
    it('globalSearchStore"s open should be false', () => {
      searchViewModel.onClose();
      expect(globalSearchStore.open).toBe(false);
    });
  });

  describe('goToConversation()', () => {
    it('should be clear search key and close global search and go to conversation with loading', async () => {
      jest.spyOn(searchViewModel, 'onClear');
      jest.spyOn(searchViewModel, 'onClose');
      const id = 1;
      await searchViewModel.goToConversation(id);
      expect(goToConversationWithLoading).toHaveBeenCalledWith({ id });
      expect(searchViewModel.onClear).toHaveBeenCalled();
      expect(searchViewModel.onClose).toHaveBeenCalled();
    });
  });

  describe('handleJoinTeam()', () => {
    it('should be clear search key and close global search and call joinTeam', async () => {
      jest.spyOn(searchViewModel, 'onClear');
      jest.spyOn(searchViewModel, 'onClose');
      const group = { id: 1 } as GroupModel;
      await searchViewModel.handleJoinTeam(group);
      expect(joinPublicTeam).toHaveBeenCalledWith(group);
      expect(searchViewModel.onClear).toHaveBeenCalled();
      expect(searchViewModel.onClose).toHaveBeenCalled();
    });
  });
});
