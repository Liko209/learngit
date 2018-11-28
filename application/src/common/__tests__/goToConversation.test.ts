/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { goToConversation } from '@/common/goToConversation';

jest.mock('sdk/service/group');
jest.mock('sdk/utils');

const { GroupService } = service;

const groupService = new GroupService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

describe('goToConversation()', () => {
  it('getConversationId() with group type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_GROUP,
    );
    expect(await goToConversation(1)).toEqual(true);
  });

  it('getConversationId() with team type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await goToConversation(1)).toEqual(true);
  });

  it('getConversationId() with other type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await goToConversation(1)).toEqual(false);
  });

  describe('getConversationId() with person type conversationId', () => {
    beforeAll(() => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
        TypeDictionary.TYPE_ID_PERSON,
      );
    });

    it('groupService return value', async () => {
      (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
        id: 2,
      });
      expect(await goToConversation(1)).toEqual(true);
    });

    it('groupService reject value', async () => {
      (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValue({
        id: 2,
      });
      expect(await goToConversation(1)).toEqual(false);
    });

    it('groupService return null', async () => {
      (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(null);
      expect(await goToConversation(1)).toEqual(false);
    });
  });
});
