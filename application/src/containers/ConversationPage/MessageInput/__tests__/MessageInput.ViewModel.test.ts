/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import {
  MessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
} from '../MessageInput.ViewModel';
import _ from 'lodash';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';

const mockGroupEntityData = {
  draft: 'draft',
};

jest.mock('@/store/utils', () => ({
  getEntity: jest.fn(() => mockGroupEntityData),
}));

const { PostService, GroupService } = service;
const postService = {
  sendPost: jest.fn(),
};
const groupService = {
  updateGroupDraft: jest.fn(),
};

PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const messageInputViewModel = new MessageInputViewModel({ id: 123 });

beforeEach(() => {
  jest.clearAllMocks();
});

describe.skip('ActionsViewModel', () => {
  it('lifecycle onReceiveProps method', () => {
    expect(messageInputViewModel._id).toBe(123);
    expect(messageInputViewModel.draft).toBe(mockGroupEntityData.draft);
  });

  it('method forceSaveDraft', () => {
    messageInputViewModel.forceSaveDraft();
    expect(groupService.updateGroupDraft).toBeCalled();
  });

  it('get computed _initDraft', () => {
    expect(messageInputViewModel._initDraft).toBe(mockGroupEntityData.draft);
  });

  it('get computed _initDraft is empty', () => {
    mockGroupEntityData.draft = '';
    expect(messageInputViewModel._initDraft).toBe(mockGroupEntityData.draft);
  });
});

describe('MessageInputViewModel', () => {
  describe('_sendPost()', () => {
    const mockThis = (content: string) => {
      const that = {
        quill: {
          getText: jest.fn().mockReturnValue(content),
          getContents: jest.fn(),
        },
      };
      return that;
    };

    const enterHandler =
      messageInputViewModel.keyboardEventHandler.enter.handler;

    it.skip('should be success when has draft content', () => {
      const content = 'text';
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.draft).toBe('');
      expect(postService.sendPost).toBeCalled();
    });

    it('should not send when empty draft content', () => {
      const content = '';
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.sendPost).toBeCalledTimes(0);
    });

    it('should not send when draft contains illegal content', () => {
      const content = CONTENT_ILLEGAL;
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
    });

    it('should generate length error when draft.length > CONTENT_LENGTH', () => {
      const content = _.pad('test', CONTENT_LENGTH + 1);
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
    });

    it('should handle error when post service fails', () => {
      postService.sendPost = jest
        .fn()
        .mockRejectedValueOnce(new Error('error'));
      const content = 'text';
      const that = mockThis(content);
      const handler = enterHandler.bind(that);
      const result = handler();
      expect(result).toBeUndefined();
    });
  });
});
