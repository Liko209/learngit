/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import { service } from 'sdk';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { goToConversation } from '@/common/goToConversation';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';

jest.mock('sdk/service/group');
jest.mock('sdk/utils');

const { GroupService } = service;

const groupService = new GroupService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

describe('goToConversation() with group or team type', () => {
  beforeEach(() => {});
  it('getConversationId() with group type conversationId', async () => {
    const globalStore = storeManager.getGlobalStore();
    jest.spyOn(globalStore, 'set');
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_GROUP,
    );

    expect(await goToConversation(1)).toEqual(true);
    expect(globalStore.set).toHaveBeenCalledWith(GLOBAL_KEYS.MESSAGE_LOADING, {
      isLoading: false,
      conversationId: 1,
    });
  });

  it('getConversationId() with team type conversationId', async () => {
    const globalStore = storeManager.getGlobalStore();
    jest.spyOn(globalStore, 'set');
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await goToConversation(1)).toEqual(true);
    expect(globalStore.set).toHaveBeenCalledWith(GLOBAL_KEYS.MESSAGE_LOADING, {
      isLoading: false,
      conversationId: 1,
    });
  });

  it('getConversationId() with other type conversationId', async () => {
    const globalStore = storeManager.getGlobalStore();
    jest.spyOn(globalStore, 'set');
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await goToConversation(1)).toEqual(false);
    expect(globalStore.set).toHaveBeenCalledWith(GLOBAL_KEYS.MESSAGE_LOADING, {
      isLoading: false,
      conversationId: 1,
    });
  });
});

describe('getConversationId() with person type conversationId', () => {
  beforeAll(() => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_PERSON,
    );
  });

  it('groupService return value', async () => {
    const globalStore = storeManager.getGlobalStore();
    jest.spyOn(globalStore, 'set');
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    expect(await goToConversation(1)).toEqual(true);
    expect(globalStore.set).toHaveBeenCalledWith(GLOBAL_KEYS.MESSAGE_LOADING, {
      isLoading: false,
      conversationId: 1,
    });
  });

  it('groupService reject value', async () => {
    const globalStore = storeManager.getGlobalStore();
    jest.spyOn(globalStore, 'set');
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValue({
      id: 2,
    });
    expect(await goToConversation(1)).toEqual(false);
    setTimeout(() => {
      expect(globalStore.set).toHaveBeenCalledWith(
        GLOBAL_KEYS.MESSAGE_LOADING,
        {
          isLoading: true,
          conversationId: 1,
        },
      );
    },         400);
  });

  it('groupService return null', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      null,
    );
    expect(await goToConversation(1)).toEqual(false);
  });
});
