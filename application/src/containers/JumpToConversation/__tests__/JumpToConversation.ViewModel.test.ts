/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 17:25:35
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { JumpToConversationViewModel } from '../JumpToConversation.ViewModel';

jest.mock('sdk/service/group');
jest.mock('sdk/utils');
jest.mock('../../../store/utils');

const { GroupService } = service;

const groupService = new GroupService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const jumpToConversationViewModel = new JumpToConversationViewModel({ id: 1 });

describe('jumpToConversationViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getConversationId() with group type conversationId', () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_GROUP,
    );

    jumpToConversationViewModel.getConversationId();
    expect(jumpToConversationViewModel.conversationId).toEqual(1);
  });

  it('getConversationId() with team type conversationId', () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );

    jumpToConversationViewModel.getConversationId();
    expect(jumpToConversationViewModel.conversationId).toEqual(1);
  });

  describe('getConversationId() with person type conversationId', () => {
    beforeAll(() => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
        TypeDictionary.TYPE_ID_PERSON,
      );
    });
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('groupService return value', async () => {
      (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
        id: 2,
      });
      await jumpToConversationViewModel.getConversationId();
      expect(jumpToConversationViewModel.conversationId).toEqual(2);
    });

    it('groupService return null', async () => {
      (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(null);
      await jumpToConversationViewModel.getConversationId();
      expect(jumpToConversationViewModel.conversationId).toEqual(0);
    });
  });
});
