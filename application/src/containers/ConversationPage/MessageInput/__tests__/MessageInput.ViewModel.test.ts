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
import { GroupConfigService } from 'sdk/service';
import { ItemService } from 'sdk/module/item';

const groupConfigService = new GroupConfigService();
(GroupConfigService as any).getInstance = () => groupConfigService;
jest.mock('sdk/service/groupConfig');
jest.mock('sdk/module/item');

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
const itemService = {
  getUploadItems: jest.fn(),
};

PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);
ItemService.getInstance = jest.fn().mockReturnValue(itemService);

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
    const mockThis = (markdownFromDeltaRes: {
      content: string;
      mentionsIds: number[];
    }) => {
      const that = {
        quill: {
          getText: jest.fn().mockReturnValue(markdownFromDeltaRes.content),
          getContents: jest.fn(),
        },
      };
      return that;
    };

    const enterHandler =
      messageInputViewModel.keyboardEventHandler.enter.handler;

    it.skip('should be success when has draft content', () => {
      const markdownFromDeltaRes = {
        content: 'text',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.draft).toBe('');
      expect(postService.sendPost).toBeCalled();
    });

    it('should not send when empty draft content', () => {
      itemService.getUploadItems = jest.fn().mockReturnValue([]);
      const markdownFromDeltaRes = {
        content: '',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.sendPost).toBeCalledTimes(0);
    });

    it('should not send when draft contains illegal content', () => {
      const markdownFromDeltaRes = {
        content: CONTENT_ILLEGAL,
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
    });

    it('should generate length error when draft.length > CONTENT_LENGTH', () => {
      const markdownFromDeltaRes = {
        content: _.pad('test', CONTENT_LENGTH + 1),
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
    });

    it('should handle error when post service fails', () => {
      postService.sendPost = jest
        .fn()
        .mockRejectedValueOnce(new Error('error'));
      const markdownFromDeltaRes = {
        content: 'text',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      const result = handler();
      expect(result).toBeUndefined();
    });
  });
  describe('cellWillChange', () => {
    it('should call groupConfigService.updateDraft when cellWillChange called', () => {
      messageInputViewModel.cellWillChange(1, 2);
      expect(groupConfigService.updateDraft).toHaveBeenCalled();
    });
  });
  describe('get draft', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call groupConfigService.getDraft if group draft has not been get from local', () => {
      messageInputViewModel.draft;
      expect(groupConfigService.getDraft).toHaveBeenCalled();
    });
    it('should not call groupConfigService.getDraft if group draft has been loaded into memory', () => {
      messageInputViewModel._id = 9999;
      messageInputViewModel._memoryDraftMap = new Map();
      messageInputViewModel._memoryDraftMap.set(9999, '9999');
      expect(groupConfigService.getDraft).toHaveBeenCalledTimes(0);
    });
  });
});
