/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-28 09:16:47
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../../../store/utils';
import { CONVERSATION_TYPES } from '@/constants';
import { MentionViewModel } from '../Mention.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../../../../../store/utils');
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
    expect(mentionViewModel.members).toEqual([]);
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
        sortableModels: [1, 2, 3],
      }),
    };
    ServiceLoader.getInstance = jest.fn().mockReturnValue(mockSearchService);

    await mentionViewModel._doFuzzySearchPersons({
      searchTerm: '',
      memberIds: mockGroupEntityData.members,
    });

    expect(mockSearchService.doFuzzySearchPersons).toBeCalledWith({
      searchKey: '',
      excludeSelf: true,
      arrangeIds: mockGroupEntityData.members,
      fetchAllIfSearchKeyEmpty: true,
    });
    expect(mentionViewModel.members).toEqual([1, 2, 3]);
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
    expect(quill.getModule).not.toBeCalled();
    mentionViewModel.open = true;
    // currentIndex default will be 1 because of title will within VL
    mentionViewModel.members = [1];
    handler();
    expect(quill.getModule).toBeCalledWith('mention');
    expect(mentionModules.select).toBeCalledWith(
      mentionViewModel.members[ mentionViewModel.currentIndex - mentionViewModel.initIndex
].id,
      mentionViewModel.members[ mentionViewModel.currentIndex - mentionViewModel.initIndex
].displayName,
      mentionViewModel._denotationChar,
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
    expect(mentionViewModel._selectHandler).toBeCalled();
  });

  it('_escapeHandler()', async () => {
    const handler = mentionViewModel._escapeHandler(mentionViewModel);
    handler();
    expect(mentionViewModel.open).toBe(false);
  });

  it('_upHandler()', async () => {
    const handler = mentionViewModel._upHandler(mentionViewModel);
    mentionViewModel.members = [1, 2, 3];
    mentionViewModel.currentIndex = 1;
    handler();
    expect(mentionViewModel.currentIndex).toBe(3);
    handler();
    expect(mentionViewModel.currentIndex).toBe(2);
    handler();
    expect(mentionViewModel.currentIndex).toBe(1);
  });

  it('_downHandler()', async () => {
    const handler = mentionViewModel._downHandler(mentionViewModel);
    mentionViewModel.members = [1, 2, 3];
    mentionViewModel.currentIndex = 1;
    handler();
    expect(mentionViewModel.currentIndex).toBe(2);
    handler();
    expect(mentionViewModel.currentIndex).toBe(3);
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
});
