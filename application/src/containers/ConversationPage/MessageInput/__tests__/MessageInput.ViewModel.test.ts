/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import {
  MessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
} from '../MessageInput.ViewModel';
import _ from 'lodash';
import * as md from 'jui/pattern/MessageInput/markdown';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';

jest.mock('sdk/module/post');
jest.mock('sdk/module/groupConfig');
jest.mock('sdk/api');

const postService = new PostService();
PostService.getInstance = jest.fn().mockReturnValue(postService);

const groupConfigService = {
  updateDraft: jest.fn(),
  getDraft: jest.fn(),
};
GroupConfigService.getInstance = () => groupConfigService;

const itemService = {
  getUploadItems: jest.fn(),
};

const mockGroupEntityData = {
  draft: 'draft',
};

let messageInputViewModel;
describe('MessageInputViewModel', () => {
  beforeEach(() => {
    jest
      .spyOn(GroupConfigService, 'getInstance')
      .mockReturnValue(groupConfigService);
    jest.spyOn(ItemService, 'getInstance').mockReturnValue(itemService);
    jest.mock('@/store/utils', () => ({
      getEntity: jest.fn(() => mockGroupEntityData),
    }));
    messageInputViewModel = new MessageInputViewModel({ id: 123 });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ActionsViewModel', () => {
    it('method forceSaveDraft', () => {
      messageInputViewModel.forceSaveDraft();
      expect(groupConfigService.updateDraft).toBeCalled();
    });
  });

  describe('MessageInputViewModel', () => {
    describe('_sendPost()', () => {
      let mockThis;
      let enterHandler;
      function markdownFromDeltaGen(text) {
        const markdownFromDeltaRes = {
          content: text,
          mentionsIds: [],
        };
        const that = mockThis(markdownFromDeltaRes);

        jest
          .spyOn(md, 'markdownFromDelta')
          .mockReturnValue(markdownFromDeltaRes);
        return enterHandler.bind(that);
      }
      beforeEach(() => {
        mockThis = (markdownFromDeltaRes: {
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
        enterHandler = messageInputViewModel.keyboardEventHandler.enter.handler;
      });
      it('should be success when has draft content', () => {
        const sendPost = jest
          .spyOn(messageInputViewModel, '_sendPost')
          .mockImplementation(() => {});
        markdownFromDeltaGen('test')();
        expect(messageInputViewModel.draft).toBe('');
        expect(sendPost).toBeCalled();
      });

      it('should not send when empty draft content', () => {
        itemService.getUploadItems = jest.fn().mockReturnValue([]);
        markdownFromDeltaGen('')();
        expect(postService.sendPost).toBeCalledTimes(0);
      });

      it('should not send when draft contains illegal content', () => {
        markdownFromDeltaGen(CONTENT_ILLEGAL)();
        expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
      });

      it('should generate length error when draft.length > CONTENT_LENGTH', () => {
        const text = _.pad('test', CONTENT_LENGTH + 1);
        markdownFromDeltaGen(text)();
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
      it('should always call onPostHandler of the props when a post sent successfully', async () => {
        const onPostHandler = jest.fn();
        messageInputViewModel = new MessageInputViewModel({
          id: 123,
          onPost: onPostHandler,
        });
        await messageInputViewModel._sendPost();
        expect(onPostHandler).toBeCalled();
      });
      it('should always call onPostHandler of the props when a post fails to sent', async () => {
        const onPostHandler = jest.fn();
        jest.spyOn(postService, 'sendPost').mockRejectedValue('');
        messageInputViewModel = new MessageInputViewModel({
          id: 123,
          onPost: onPostHandler,
        });
        await messageInputViewModel._sendPost();
        expect(onPostHandler).toBeCalled();
      });
    });
    describe('cellWillChange', () => {
      it('should call groupConfigService.updateDraft when cellWillChange called', () => {
        messageInputViewModel.cellWillChange(1, 2);
        expect(groupConfigService.updateDraft).toHaveBeenCalled();
      });
    });
    describe('get draft', () => {
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
});
