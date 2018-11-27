/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { getConversationId } from '@/common/goToConversation';

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
    expect(await getConversationId(1)).toEqual(1);
  });

  it('getConversationId() with team type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await getConversationId(1)).toEqual(1);
  });

  it('getConversationId() with other type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await getConversationId(1)).toEqual(null);
  });

  describe('getConversationId() with person type conversationId', () => {
    beforeAll(() => {
      (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
        TypeDictionary.TYPE_ID_PERSON,
      );
    });

    it('groupService return value', async () => {
      (groupService.getGroupByMemberList as jest.Mock).mockResolvedValue({
        id: 2,
      });
      expect(await getConversationId(1)).toEqual(2);
    });

    it('groupService return null', async () => {
      (groupService.getGroupByMemberList as jest.Mock).mockResolvedValue(null);
      expect(await getConversationId(1)).toEqual(null);
    });
  });
});
