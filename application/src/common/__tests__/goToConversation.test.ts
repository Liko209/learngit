/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary, BaseError } from 'sdk/utils';
import { goToConversation } from '@/common/goToConversation';
import { ok, err } from 'foundation';
jest.mock('sdk/service/group');
jest.mock('sdk/utils');

const { GroupService } = service;

const groupService = new GroupService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

describe('goToConversation() with group or team type', () => {
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
});

describe('getConversationId() with person type conversationId', () => {
  beforeAll(() => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_PERSON,
    );
  });

  it('groupService should return ok', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    expect(await goToConversation(1)).toEqual(true);
  });

  it('groupService should return err', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValueOnce(
      err(new BaseError(500, '')),
    );
    expect(await goToConversation(1)).toEqual(false);
  });
});
