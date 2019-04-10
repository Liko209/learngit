/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-04 12:21:25
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { container, Jupiter } from 'framework';
import { config } from '../../../module.config';
import { GlobalSearchStore } from '../../../store';
import { SearchService } from 'sdk/module/search';
import { ServiceLoader } from 'sdk/module/serviceLoader';

import history from '../../../../../history';

jest.mock('@/containers/Notification');
jest.mock('sdk/api');
jest.mock('sdk/dao');
jest.mock('sdk/module/search');
jest.mock('@/common/joinPublicTeam');
jest.mock('@/store/utils');
jest.mock('../../../../../utils/i18nT');

// import i18nT from '../../../../../utils/i18nT';
import { SearchItemTypes } from '../types';
import { RecentSearchViewModel } from '../RecentSearch.ViewModel';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('RecentSearchViewModel', () => {
  let searchService: SearchService;
  let recentSearchViewModel: RecentSearchViewModel;
  let globalSearchStore: GlobalSearchStore;

  function setUp() {
    history.replace('/');
    searchService = new SearchService();
    searchService.doFuzzySearchPersons = jest.fn().mockImplementation(() => {
      return { terms: [], sortableModels: [{ id: 1 }] };
    });
    searchService.clearRecentSearchRecords = jest.fn();
    searchService.getRecentSearchRecords = jest.fn().mockReturnValue([]);
    ServiceLoader.getInstance = jest.fn().mockReturnValue(searchService);
  }

  beforeEach(() => {
    container.snapshot();
    clearMocks();
    setUp();
    recentSearchViewModel = new RecentSearchViewModel();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });

  describe('onClear()', () => {
    it('global search store search key should be empty', () => {
      recentSearchViewModel.onClear();
      expect(globalSearchStore.searchKey).toBe('');
    });
  });
  describe('onClose()', () => {
    it('global search store open should be false', () => {
      recentSearchViewModel.onClear();
      expect(globalSearchStore.open).toBeFalsy();
    });
  });

  describe('onKeyUp()', () => {
    it('if select index === 0 should be return 0', () => {
      recentSearchViewModel.setSelectIndex(0);
      recentSearchViewModel.onKeyUp();
      expect(recentSearchViewModel.selectIndex).toBe(0);
    });
    it('if select index !== 0 should be return select index - 1', () => {
      recentSearchViewModel.setSelectIndex(1);
      recentSearchViewModel.onKeyUp();
      expect(recentSearchViewModel.selectIndex).toBe(0);
    });
  });

  describe('onKeyDown()', () => {
    it('if select index === recent record length should be return length - 1', () => {
      jest
        .spyOn(recentSearchViewModel, 'recentRecord', 'get')
        .mockReturnValue([1, 2]);
      recentSearchViewModel.setSelectIndex(1);
      recentSearchViewModel.onKeyDown();
      expect(recentSearchViewModel.selectIndex).toBe(1);
    });

    it('if select index !== recent record length select index should be + 1', () => {
      jest
        .spyOn(recentSearchViewModel, 'recentRecord', 'get')
        .mockReturnValue([1, 2, 3]);
      recentSearchViewModel.setSelectIndex(1);
      recentSearchViewModel.onKeyDown();
      expect(recentSearchViewModel.selectIndex).toBe(2);
    });
  });

  describe('canJoinTeam()', () => {
    it('If isTeam && privacy = protected & !isMember canJoinTeam should be true', () => {
      const group = {
        isTeam: true,
        privacy: 'protected',
        members: [1],
        isMember: false,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(recentSearchViewModel.canJoinTeam(1).canJoin).toBeTruthy();
      expect(recentSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isTeam = false canJoinTeam should be false', () => {
      const group = {
        isTeam: false,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(recentSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(recentSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isMember = true canJoinTeam should be false', () => {
      const group = {
        isMember: true,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(recentSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(recentSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If privacy != protected canJoinTeam should be false', () => {
      const group = {
        privacy: '',
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(recentSearchViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(recentSearchViewModel.canJoinTeam(1).group).toEqual(group);
    });
  });

  describe('onEnter()', () => {
    beforeEach(() => {
      jest
        .spyOn(recentSearchViewModel, 'addRecentRecord')
        .mockImplementation(() => {});
      jest
        .spyOn(recentSearchViewModel, 'fetchRecent')
        .mockImplementation(() => {});
    });
    it('If select item type is people should be go to conversation', () => {
      const id = 1;
      jest.spyOn(recentSearchViewModel, 'goToConversation');
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.PEOPLE);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      recentSearchViewModel.onEnter(keyBoardEvent);
      expect(recentSearchViewModel.goToConversation).toHaveBeenCalledWith(id);
      expect(recentSearchViewModel.addRecentRecord).toHaveBeenCalled();
    });
    it('If select item type is team/group and cannot join should be go to conversation', () => {
      const id = 1;
      const canJoin = {
        canJoin: false,
        group: {},
      } as any;
      jest.spyOn(recentSearchViewModel, 'goToConversation');
      jest.spyOn(recentSearchViewModel, 'canJoinTeam').mockReturnValue(canJoin);
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.GROUP);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      recentSearchViewModel.onEnter(keyBoardEvent);
      expect(recentSearchViewModel.goToConversation).toHaveBeenCalledWith(id);
      expect(recentSearchViewModel.addRecentRecord).toHaveBeenCalled();
    });
    it('If select item type is team/group and can join should be call handleJoinTeam', () => {
      const id = 1;
      const canJoin = {
        canJoin: true,
        group: {},
      } as any;
      jest.spyOn(recentSearchViewModel, 'handleJoinTeam');
      jest.spyOn(recentSearchViewModel, 'canJoinTeam').mockReturnValue(canJoin);
      jest
        .spyOn(recentSearchViewModel, 'currentItemValue', 'get')
        .mockReturnValue(id);
      jest
        .spyOn(recentSearchViewModel, 'currentItemType', 'get')
        .mockReturnValue(SearchItemTypes.TEAM);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      recentSearchViewModel.onEnter(keyBoardEvent);
      expect(recentSearchViewModel.handleJoinTeam).toHaveBeenCalledWith(
        canJoin.group,
      );
      expect(recentSearchViewModel.addRecentRecord).toHaveBeenCalled();
    });
  });

  describe('clearRecent()', () => {
    it('should be clear recent record', () => {
      recentSearchViewModel.recentRecord = [1, 2];
      recentSearchViewModel.clearRecent();
      expect(searchService.clearRecentSearchRecords).toHaveBeenCalled();
      expect(recentSearchViewModel.recentRecord).toEqual([]);
    });
  });
});
