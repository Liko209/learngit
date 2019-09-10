/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GroupService } from 'sdk/module/group';
import {
  JNetworkError,
  ERROR_CODES_NETWORK,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import {
  goToConversationWithLoading,
  DELAY_LOADING,
} from '@/common/goToConversation';
import { PostService } from 'sdk/module/post';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ERROR_TYPES } from '@/common/catchError';
import { MessageRouterChangeHelper } from '../../modules/message/container/Message/helper';

jest.mock('sdk/module/post');
jest.mock('@/history');
jest.mock('sdk/module/group');
jest.mock('sdk/utils');
jest.mock('@/containers/Notification');
const {} = service;

const postService = new PostService();
const groupService = new GroupService();

ServiceLoader.getInstance = jest
  .fn()
  .mockImplementation((serviceName: string) => {
    if (serviceName === ServiceConfig.POST_SERVICE) {
      return postService;
    }
    if (serviceName === ServiceConfig.GROUP_SERVICE) {
      return groupService;
    }
    return null;
  });

beforeAll(() => {
  jest.clearAllMocks();
  Object.defineProperty(window.history, 'state', {
    writable: true,
    value: {},
  });
  history.push = jest.fn().mockImplementation(jest.fn());
  history.replace = jest.fn().mockImplementation(jest.fn());
  jest
    .spyOn(MessageRouterChangeHelper, 'goToConversation')
    .mockImplementation();
});

describe('goToConversation()', () => {
  it('getConversationId() with group type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_GROUP,
    );

    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '1',
      'PUSH',
    );
  });

  it('getConversationId() with team type conversationId [JPT-717]', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '1',
      'PUSH',
    );
  });

  it('getConversationId() with other type conversationId should throw error', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: undefined,
      error: true,
      errorType: ERROR_TYPES.UNKNOWN,
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
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([1]);
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '2',
      'PUSH',
    );
  });

  it('groupService should return backend err [JPT-2081/JPT-2247/JPT-2067/JPT-430/JPT-427/JPT-2087]', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: 1 },
      error: true,
      errorType: ERROR_TYPES.BACKEND,
    });
  });

  it('groupService should return network err [JPT-2084/JPT-2248/JPT-2068/JPT-429/JPT-428/JPT-2088]', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: 1 },
      error: true,
      errorType: ERROR_TYPES.NETWORK,
    });
  });
});

describe('getConversationId() with multiple person type conversationId', () => {
  it('groupService should return ok', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    expect(await goToConversationWithLoading({ id: [1, 2, 3] })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '2',
      'PUSH',
    );
  });

  it('groupService should return backend err [JPT-2081/JPT-2247/JPT-2067/JPT-430/JPT-427/JPT-2087]', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
    );
    expect(await goToConversationWithLoading({ id: [1, 2, 3] })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3] },
      error: true,
      errorType: ERROR_TYPES.BACKEND,
    });
  });

  it('groupService should return network err [JPT-2084/JPT-2248/JPT-2068/JPT-429/JPT-428/JPT-2088]', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
    );
    expect(await goToConversationWithLoading({ id: [1, 2, 3] })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3] },
      error: true,
      errorType: ERROR_TYPES.NETWORK,
    });
  });
});

describe('getConversationId() with message', () => {
  it('should show loading then open the conversation and send the message when success [JPT-692/JPT-697/JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    const beforeJump = (id: number) =>
      postService.sendPost({ text: 'hahahah', groupId: 2 });
    expect(
      await goToConversationWithLoading({
        beforeJump,
        id: [1, 2, 3],
        message: 'hahahah',
      }),
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
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '2',
      'PUSH',
    );
  });

  it('should show loading then show error page if failed [JPT-2081/JPT-2247/JPT-2067/JPT-430/JPT-427/JPT-2087/JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
    );
    expect(
      await goToConversationWithLoading({ id: [1, 2, 3], message: 'hahahah' }),
    ).toEqual(false);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([
      1,
      2,
      3,
    ]);
    expect(postService.sendPost).not.toHaveBeenCalled();
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3], message: 'hahahah' },
      error: true,
      errorType: ERROR_TYPES.BACKEND,
    });
  });

  it('should show loading then show error page if failed(network error) [JPT-2084/JPT-2248/JPT-2068/JPT-429/JPT-428/JPT-2088/JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (postService.sendPost as jest.Mock).mockRejectedValue(
      new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
    );
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    const beforeJump = (id: number) =>
      postService.sendPost({ text: 'hahahah', groupId: 2 });
    expect(
      await goToConversationWithLoading({
        beforeJump,
        id: [1, 2, 3],
        message: 'hahahah',
      }),
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
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: {
        id: [1, 2, 3],
        message: 'hahahah',
        hasBeforeJumpFun: true,
      },
      error: true,
      errorType: ERROR_TYPES.NETWORK,
    });
  });

  it('should show loading then show error page if failed(server error) [JPT-2081/JPT-2247/JPT-2067/JPT-430/JPT-427/JPT-2087/JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (postService.sendPost as jest.Mock).mockRejectedValue(
      new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
    );
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    const beforeJump = (id: number) =>
      postService.sendPost({ text: 'hahahah', groupId: 2 });
    expect(
      await goToConversationWithLoading({
        beforeJump,
        id: [1, 2, 3],
        message: 'hahahah',
      }),
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
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: {
        id: [1, 2, 3],
        message: 'hahahah',
        hasBeforeJumpFun: true,
      },
      error: true,
      errorType: ERROR_TYPES.BACKEND,
    });
  });
});

describe('has loading component', () => {
  it('should be loading component when get conversation id greater than the maximum delay display loading time', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockImplementationOnce(
      () => {
        return new Promise((resolve: any) => {
          setTimeout(() => {
            resolve({
              id: 1,
            });
          }, DELAY_LOADING * 2);
        });
      },
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([1]);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(MessageRouterChangeHelper.goToConversation).toHaveBeenCalledWith(
      '1',
      'PUSH',
    );
  });
});
