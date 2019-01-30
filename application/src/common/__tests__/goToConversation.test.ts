/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import { goToConversation } from '@/common/goToConversation';
import { ok, err } from 'foundation';
import { NewPostService } from 'sdk/module/post';

jest.mock('sdk/module/post');
jest.mock('@/history');
jest.mock('sdk/service/group');
jest.mock('sdk/utils');
jest.mock('@/containers/Notification');

const { GroupService } = service;

const postService = new NewPostService();
NewPostService.getInstance = jest.fn().mockReturnValue(postService);

const groupService = new GroupService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);
beforeAll(() => {
  Object.defineProperty(window.history, 'state', {
    writable: true,
    value: {},
  });
  history.push = jest.fn().mockImplementation(jest.fn());
  history.replace = jest.fn().mockImplementation(jest.fn());
});

describe('goToConversation()', () => {
  it('getConversationId() with group type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_GROUP,
    );

    expect(await goToConversation({ id: 1 })).toEqual(true);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/1');
  });

  it('getConversationId() with team type conversationId [JPT-717]', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await goToConversation({ id: 1 })).toEqual(true);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/1');
  });

  it('getConversationId() with other type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await goToConversation({ id: 1 })).toEqual(false);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: 1 },
      error: true,
    });
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
    expect(await goToConversation({ id: 1 })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([1]);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('groupService should return err', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValueOnce(
      err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
    );
    expect(await goToConversation({ id: 1 })).toEqual(false);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: 1 },
      error: true,
    });
  });
});

describe('getConversationId() with  multiple person type conversationId', () => {
  it('groupService should return ok', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    expect(await goToConversation({ id: [1, 2, 3] })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('groupService should return err', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValueOnce(
      err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
    );
    expect(await goToConversation({ id: [1, 2, 3] })).toEqual(false);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3] },
      error: true,
    });
  });
});

describe('getConversationId() with message', () => {
  it('should show loading then open the conversation and send the message when success [JPT-692] [JPT-697]', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    const beforeJump = (id: number) =>
      postService.sendPost({ text: 'hahahah', groupId: 2 });
    expect(
      await goToConversation({ beforeJump, id: [1, 2, 3], message: 'hahahah' }),
    ).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(postService.sendPost).toHaveBeenCalledWith({
      groupId: 2,
      text: 'hahahah',
    });
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('should show loading then show error page if failed [JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValueOnce(
      err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
    );
    expect(
      await goToConversation({ id: [1, 2, 3], message: 'hahahah' }),
    ).toEqual(false);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(postService.sendPost).not.toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3], message: 'hahahah' },
      error: true,
    });
  });

  it('should show loading then show error page if failed [JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (postService.sendPost as jest.Mock).mockRejectedValue(new Error());
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    const beforeJump = (id: number) =>
      postService.sendPost({ text: 'hahahah', groupId: 2 });
    expect(
      await goToConversation({ beforeJump, id: [1, 2, 3], message: 'hahahah' }),
    ).toEqual(false);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(postService.sendPost).toHaveBeenCalledWith({
      groupId: 2,
      text: 'hahahah',
    });
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3], message: 'hahahah' },
      error: true,
    });
  });
});
