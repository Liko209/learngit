/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-10 16:47:06
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { config } from '../../../module.config';
import { getEntity } from '@/store/utils';
import { GlobalSearchStore } from '../../../store';

import { SearchCellViewModel } from '../SearchCell.ViewModel';
import { SearchItemTypes, SEARCH_SCOPE, SEARCH_VIEW } from '../../../types';

jest.mock('sdk/dao');
jest.mock('@/store/utils');
jest.mock('sdk/module/config');

const jupiter = container.get(Jupiter);
jupiter.registerModule(config);

describe('SearchCellViewModel', () => {
  let searchCellViewModel: SearchCellViewModel<any>;
  let globalSearchStore: GlobalSearchStore;

  beforeEach(() => {
    container.snapshot();

    searchCellViewModel = new SearchCellViewModel();
    globalSearchStore = container.get(GlobalSearchStore);
  });

  afterEach(() => {
    container.restore();
  });

  describe('onKeyUp()', () => {
    it('if select index === 0 should be return 0', () => {
      searchCellViewModel.setSelectIndex(0);
      searchCellViewModel.onKeyUp();
      expect(searchCellViewModel.selectIndex).toBe(0);
    });
    it('if select index !== 0 should be return select index - 1', () => {
      searchCellViewModel.setSelectIndex(1);
      searchCellViewModel.onKeyUp();
      expect(searchCellViewModel.selectIndex).toBe(0);
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
      expect(searchCellViewModel.canJoinTeam(1).canJoin).toBeTruthy();
      expect(searchCellViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isTeam = false canJoinTeam should be false', () => {
      const group = {
        isTeam: false,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(searchCellViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(searchCellViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If isMember = true canJoinTeam should be false', () => {
      const group = {
        isMember: true,
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(searchCellViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(searchCellViewModel.canJoinTeam(1).group).toEqual(group);
    });
    it('If privacy != protected canJoinTeam should be false', () => {
      const group = {
        privacy: '',
      };
      (getEntity as jest.Mock).mockReturnValue(group);
      expect(searchCellViewModel.canJoinTeam(1).canJoin).toBeFalsy();
      expect(searchCellViewModel.canJoinTeam(1).group).toEqual(group);
    });
  });

  describe('onSelectItem() [JPT-1567]', () => {
    it('If select item is message should be go to full search', () => {
      const currentItemValue = 'aa';
      const currentItemType = SearchItemTypes.SEARCH;
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      const params = {
        groupId: 1,
      };
      searchCellViewModel.onSelectItem(
        keyBoardEvent,
        currentItemValue,
        currentItemType,
        params,
      );
      expect(globalSearchStore.groupId).toBe(params.groupId);
      expect(globalSearchStore.searchScope).toBe(SEARCH_SCOPE.CONVERSATION);
      expect(globalSearchStore.currentView).toBe(SEARCH_VIEW.FULL_SEARCH);
      expect(globalSearchStore.searchKey).toBe(currentItemValue);
    });
    it('If select item type is people should be go to conversation', () => {
      const id = 1;
      const currentItemValue = 1;
      const currentItemType = SearchItemTypes.PEOPLE;
      jest.spyOn(searchCellViewModel, 'goToConversation');
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      searchCellViewModel.onSelectItem(
        keyBoardEvent,
        currentItemValue,
        currentItemType,
      );

      expect(searchCellViewModel.goToConversation).toHaveBeenCalledWith(id);
    });
    it('If select item type is team/group and cannot join should be go to conversation', () => {
      const id = 1;
      const currentItemValue = 1;
      const currentItemType = SearchItemTypes.GROUP;
      const canJoin = {
        canJoin: false,
        group: {},
      } as any;
      jest.spyOn(searchCellViewModel, 'goToConversation');
      jest.spyOn(searchCellViewModel, 'canJoinTeam').mockReturnValue(canJoin);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      searchCellViewModel.onSelectItem(
        keyBoardEvent,
        currentItemValue,
        currentItemType,
      );
      expect(searchCellViewModel.goToConversation).toHaveBeenCalledWith(id);
    });
    it('If select item type is team/group and can join should be call handleJoinTeam', () => {
      const currentItemValue = 1;
      const currentItemType = SearchItemTypes.TEAM;
      const canJoin = {
        canJoin: true,
        group: {},
      } as any;
      jest
        .spyOn(searchCellViewModel, 'handleJoinTeam')
        .mockImplementation(() => {});
      jest.spyOn(searchCellViewModel, 'canJoinTeam').mockReturnValue(canJoin);
      const keyBoardEvent = {
        preventDefault: jest.fn(),
      } as any;
      searchCellViewModel.onSelectItem(
        keyBoardEvent,
        currentItemValue,
        currentItemType,
      );
      expect(searchCellViewModel.handleJoinTeam).toHaveBeenCalledWith(
        canJoin.group,
      );
    });
  });
});
