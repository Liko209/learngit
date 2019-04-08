/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-27 17:13:48
 * Copyright © RingCentral. All rights reserved.
 */
import history from '@/history';
import { service } from 'sdk';
import { GroupService } from 'sdk/module/group';
import { JNetworkError, ERROR_CODES_NETWORK } from 'sdk/error';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import {
  goToConversationWithLoading,
  DELAY_LOADING,
} from '@/common/goToConversation';
import { PostService } from 'sdk/module/post';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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

    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(history.replace).toHaveBeenCalledWith('/messages/1');
  });

  it('getConversationId() with team type conversationId [JPT-717]', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_TEAM,
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(history.replace).toHaveBeenCalledWith('/messages/1');
  });

  it('getConversationId() with other type conversationId', async () => {
    (GlipTypeUtil.extractTypeId as jest.Mock).mockReturnValue(
      TypeDictionary.TYPE_ID_CALL,
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(false);
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
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockResolvedValue({
      id: 2,
    });
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([1]);
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('groupService should return err', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, ''),
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: 1 },
      error: true,
    });
  });
});

describe('getConversationId() with  multiple person type conversationId', () => {
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
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('groupService should return err', async () => {
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, ''),
    );
    expect(await goToConversationWithLoading({ id: [1, 2, 3] })).toEqual(false);
    expect(history.replace).toHaveBeenCalledWith('/messages/loading', {
      params: { id: [1, 2, 3] },
      error: true,
    });
  });
});

describe('getConversationId() with message', () => {
  it('should show loading then open the conversation and send the message when success [JPT-692] [JPT-697]', async () => {
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
    expect(history.replace).toHaveBeenCalledWith('/messages/2');
  });

  it('should show loading then show error page if failed [JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (groupService.getOrCreateGroupByMemberList as jest.Mock).mockRejectedValueOnce(
      new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, ''),
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
    });
  });

  it('should show loading then show error page if failed [JPT-280]', async () => {
    postService.sendPost = jest.fn();
    (postService.sendPost as jest.Mock).mockRejectedValue(new Error());
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
      params: { id: [1, 2, 3], message: 'hahahah' },
      error: true,
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
          },         DELAY_LOADING * 2);
        });
      },
    );
    expect(await goToConversationWithLoading({ id: 1 })).toEqual(true);
    expect(groupService.getOrCreateGroupByMemberList).toHaveBeenCalledWith([1]);
    expect(history.push).toHaveBeenCalledWith('/messages/loading');
    expect(history.replace).toHaveBeenCalledWith('/messages/1');
  });
});
