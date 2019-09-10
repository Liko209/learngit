/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-28 09:16:47
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { MentionViewModel } from '../Mention.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.unmock('react-quill');
jest.unmock('quill');
jest.mock('@/store/utils');
jest.mock('sdk/module/search');

let mentionViewModel: MentionViewModel;

const mockGroupEntityData: {
  type: CONVERSATION_TYPES;
  members: number[];
} = {
  type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
  members: [1, 2, 3],
};

describe('mentionViewModel', () => {
  let mockSearchService: any;

  beforeEach(() => {
    mockSearchService = {
      doFuzzySearchPersons: jest.fn(),
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockSearchService);

    (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);

    mentionViewModel = new MentionViewModel({ id: 1 });
  });

  it('lifecycle method', () => {
    expect(mentionViewModel._id).toBe(1);
    expect(mentionViewModel.currentIndex).toBe(0);
    expect(mentionViewModel.open).toBe(false);
    expect(mentionViewModel.membersId).toEqual([]);
    expect(mentionViewModel.searchTerm).toBe(undefined);
  });

  it('_group', () => {
    expect(mentionViewModel._group).toBe(mockGroupEntityData);
  });

  it('groupType', () => {
    expect(mentionViewModel.groupType).toBe(mockGroupEntityData.type);
  });

  it('_memberIds', () => {
    expect(mentionViewModel._memberIds).toBe(mockGroupEntityData.members);
  });

  it('_onMention()', () => {
    mentionViewModel._onMention(true, '', '@');
    expect(mentionViewModel.open).toBe(true);
    expect(mentionViewModel.searchTerm).toBe('');
    expect(mentionViewModel._denotationChar).toBe('@');
    mentionViewModel._onMention(false, '', '@');
    expect(mentionViewModel.open).toBe(false);
  });

  it('_doFuzzySearchPersons()', async () => {
    mockSearchService = {
      doFuzzySearchPersons: jest.fn().mockResolvedValue({
        sortableModels: [{ id: 1 }, { id: 2 }, { id: 3 }],
      }),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockSearchService);

    await mentionViewModel._doFuzzySearchPersons({
      searchTerm: '',
      memberIds: mockGroupEntityData.members,
    });

    expect(mockSearchService.doFuzzySearchPersons).toHaveBeenCalledWith('', {
      excludeSelf: true,
      arrangeIds: mockGroupEntityData.members,
      fetchAllIfSearchKeyEmpty: true,
      recentFirst: true,
    });
    expect(mentionViewModel.membersId).toEqual([1, 2, 3]);
  });

  it('_selectHandler()', async () => {
    const mentionModules = {
      select: jest.fn(),
    };
    const quill = {
      getModule: jest.fn().mockReturnValue(mentionModules),
    };
    const handler = mentionViewModel._selectHandler(mentionViewModel).bind({
      quill,
    });
    handler();
    expect(quill.getModule).not.toHaveBeenCalled();
    mentionViewModel.open = true;
    // currentIndex default will be 1 because of title will within VL
    mentionViewModel.membersId = [1];
    mentionViewModel.membersDisplayName = ['name'];
    handler();
    expect(quill.getModule).toHaveBeenCalledWith('mention');
    expect(mentionModules.select).toHaveBeenCalledWith(
      mentionViewModel.membersId[mentionViewModel.currentIndex],
      mentionViewModel.membersDisplayName[mentionViewModel.currentIndex],
      mentionViewModel._denotationChar,
      mentionViewModel.isTeam,
    );
    expect(mentionViewModel.open).toBe(false);
  });

  it('selectHandler()', async () => {
    const handler = mentionViewModel.selectHandler(1).bind(mentionViewModel);
    mentionViewModel._selectHandler = jest.fn().mockReturnValue(jest.fn());
    document.querySelector = jest.fn().mockReturnValue({
      __quill: jest.fn(),
    });
    handler();
    expect(mentionViewModel.currentIndex).toBe(1);
    expect(mentionViewModel._selectHandler).toHaveBeenCalled();
  });

  it('_escapeHandler()', async () => {
    const handler = mentionViewModel._escapeHandler(mentionViewModel);
    handler();
    expect(mentionViewModel.open).toBe(false);
  });

  it('_upHandler()', async () => {
    const handler = mentionViewModel._upHandler(mentionViewModel);
    mentionViewModel.membersId = [1, 2, 3];
    mentionViewModel.currentIndex = 1;
    handler();
    expect(mentionViewModel.currentIndex).toBe(0);
    handler();
    expect(mentionViewModel.currentIndex).toBe(2);
    handler();
    expect(mentionViewModel.currentIndex).toBe(1);
  });

  it('_downHandler()', async () => {
    const handler = mentionViewModel._downHandler(mentionViewModel);
    mentionViewModel.membersId = [1, 2, 3];
    mentionViewModel.currentIndex = 1;
    handler();
    expect(mentionViewModel.currentIndex).toBe(2);
    handler();
    expect(mentionViewModel.currentIndex).toBe(0);
    handler();
    expect(mentionViewModel.currentIndex).toBe(1);
  });

  describe('get isOneToOneGroup', () => {
    it('If conversation type is NORMAL_GROUP isOneToOneGroup is false', () => {
      const mockGroupEntityData: {
        type: CONVERSATION_TYPES;
      } = {
        type: CONVERSATION_TYPES.NORMAL_GROUP,
      };

      (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);
      mentionViewModel = new MentionViewModel({ id: 1 });
      expect(mentionViewModel.isOneToOneGroup).toBeFalsy();
    });
    it('If conversation type is NORMAL_ONE_TO_ONE isOneToOneGroup is true', () => {
      const mockGroupEntityData: {
        type: CONVERSATION_TYPES;
      } = {
        type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      };

      (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);
      mentionViewModel = new MentionViewModel({ id: 1 });
      expect(mentionViewModel.isOneToOneGroup).toBeTruthy();
    });
  });

  describe('searchTermMatchTeam()', () => {
    beforeEach(() => {
      mentionViewModel = new MentionViewModel({ id: 1 });
    });
    it('should return true when search empty text', () => {
      const searchTerm = '';
      mentionViewModel.searchTerm = searchTerm;
      expect(mentionViewModel.searchTermMatchTeam).toBeTruthy();
    });
    it('should return true when search team', () => {
      const searchTerm = 'team';
      mentionViewModel.searchTerm = searchTerm;
      expect(mentionViewModel.searchTermMatchTeam).toBeTruthy();
    });
    it('should return false if search some text out of team', () => {
      const searchTerm = 'teamtest';
      mentionViewModel.searchTerm = searchTerm;
      expect(mentionViewModel.searchTermMatchTeam).toBeFalsy();
    });
  });
  describe('isTeam()', () => {
    it('should return true when groupType is team', () => {
      const mockGroupEntityData: {
        type: CONVERSATION_TYPES;
      } = {
        type: CONVERSATION_TYPES.TEAM,
      };
      (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);
      mentionViewModel = new MentionViewModel({ id: 1 });
      expect(mentionViewModel.isTeam).toBeTruthy();
    });
    it('should return false when grouptype is not team', () => {
      const mockGroupEntityData: {
        type: CONVERSATION_TYPES;
      } = {
        type: CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      };
      (getEntity as jest.Mock).mockReturnValue(mockGroupEntityData);
      mentionViewModel = new MentionViewModel({ id: 1 });
      expect(mentionViewModel.isTeam).toBeFalsy();
    });
  });
});
