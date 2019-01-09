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
import { ERROR_CODES_SERVER, JServerError } from 'sdk/error';
import { Notification } from '@/containers/Notification';
jest.mock('@/history');
jest.mock('sdk/service/group');
jest.mock('sdk/utils');
jest.mock('@/containers/Notification');

const { GroupService, PostService } = service;

const groupService = new GroupService();
const postService = new PostService();
GroupService.getInstance = jest.fn().mockReturnValue(groupService);
PostService.getInstance = jest.fn().mockReturnValue(postService);
beforeAll(() => {
  Object.defineProperty(window.history, 'state', {
    writable: true,
    value: {},
  });
  history.push = jest.fn().mockImplementation(jest.fn());
  history.replace = jest.fn().mockImplementation(jest.fn());
});

describe('goToConversation()', () => {
  it('should display flash toast notification has message {JoinTeamAuthorizedError} when join a public team then permission changed.[JPT-722]', async (done: jest.DoneCallback) => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    const joinTeamFun = () => {
      throw new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, '');
    };
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    await goToConversation({ joinTeamFun, id: 1 });
    setTimeout(() => {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'JoinTeamAuthorizedError',
        }),
      );
      done();
    },         0);
  });
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
      errObj: new Error('Conversation not found.'),
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
      errObj: new Error('Conversation not found.'),
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
      errObj: new Error('Conversation not found.'),
    });
  });
});

describe('getConversationId() with message', () => {
  it('should show loading then open the conversation and send the message when success, JPT-692 JPT-697', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    expect(
      await goToConversation({ id: [1, 2, 3], message: 'hahahah' }),
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

  it('should show loading then show error page if failed', async () => {
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
      errObj: new Error('Conversation not found.'),
    });
  });

  it('should show loading then show error page if failed', async () => {
    postService.sendPost = jest.fn();
    (postService.sendPost as jest.Mock).mockRejectedValue(new Error());
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue(
      ok({
        id: 2,
      }),
    );
    expect(
      await goToConversation({ id: [1, 2, 3], message: 'hahahah' }),
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
      errObj: new Error('Conversation not found.'),
    });
  });
});
