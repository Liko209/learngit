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
import { PostService } from 'sdk/module/post';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { DeltaStatic } from 'quill';
import { ConvertList, WhiteOnlyList } from 'jui/pattern/Emoji/excludeList';

jest.mock('sdk/module/post');
jest.mock('sdk/module/groupConfig');
jest.mock('sdk/api');

const postService = new PostService();

const groupConfigService = {
  updateDraft: jest.fn(),
  getDraft: jest.fn(),
};

const itemService = {
  getUploadItems: jest.fn(),
};

ServiceLoader.getInstance = jest
  .fn()
  .mockImplementation((serviceName: string) => {
    if (serviceName === ServiceConfig.POST_SERVICE) {
      return postService;
    }

    if (serviceName === ServiceConfig.ITEM_SERVICE) {
      return itemService;
    }

    if (serviceName === ServiceConfig.GROUP_CONFIG_SERVICE) {
      return groupConfigService;
    }

    return null;
  });

const mockGroupEntityData = {
  draft: 'draft',
};

let messageInputViewModel;
describe('MessageInputViewModel', () => {
  beforeEach(() => {
    jest.mock('@/store/utils', () => ({
      getEntity: jest.fn(() => mockGroupEntityData),
    }));
    messageInputViewModel = new MessageInputViewModel({ id: 123 });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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
      it('should clear last enter line while enter text and press enter button', () => {
        expect(
          md.markdownFromDelta({
            ops: [
              {
                insert: '123\n345\n',
              },
            ],
          } as DeltaStatic).content,
        ).toBe('123\n345');
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
    describe('forceSaveDraft', () => {
      it('should call groupConfigService updateDraft', () => {
        messageInputViewModel.forceSaveDraft();
        expect(groupConfigService.updateDraft).toBeCalled();
      });
      it('should not remove empty line with any text when save draft', () => {
        const draft = '<p><br></p><p>111</p>';
        messageInputViewModel.draft = draft;
        messageInputViewModel.forceSaveDraft();
        expect(messageInputViewModel._memoryDraftMap.get(123)).toBe(draft);
      });
      it('should remove empty line without any text when save draft', () => {
        messageInputViewModel.draft = '<p><br></p><p><br></p>';
        messageInputViewModel.forceSaveDraft();
        expect(messageInputViewModel._memoryDraftMap.get(123)).toBe('');
      });
    });
    describe('insertEmoji', () => {
      it('should insert emoji colons into message input box if call insertEmoji', () => {
        const emoji = { colons: ':smile:' };
        const focusIndex = { index: 1 };
        const mockQuill = {
          focus: jest.fn(),
          getSelection: jest.fn().mockReturnValue(focusIndex),
          insertText: jest.fn(),
        };
        document.querySelector = jest.fn().mockReturnValue({
          __quill: mockQuill,
        });
        messageInputViewModel.insertEmoji(emoji);
        expect(mockQuill.focus).toBeCalled();
        expect(mockQuill.getSelection()).toEqual(focusIndex);
        expect(mockQuill.insertText).toBeCalledWith(
          focusIndex.index,
          emoji.colons,
        );
        expect(messageInputViewModel.cb).toBeCalled;
      });
      it('should call _doUnderscoreTransfer if emoji in Convert List', () => {
        const emoji = { colons: ':flag-ac:' };
        const afterTrasfer = ':flag_ac:';
        messageInputViewModel.insertEmoji(emoji);
        expect(
          messageInputViewModel._doUnderscoreTransfer(emoji.colons),
        ).toEqual(afterTrasfer);
      });
      it('should call _doToneTransfer if emoji is in different skin color', () => {
        const emoji = { colons: ':baby::skin-tone-2:' };
        const afterTrasfer = ':baby_tone1:';
        messageInputViewModel.insertEmoji(emoji);
        expect(messageInputViewModel._doToneTransfer(emoji.colons)).toEqual(
          afterTrasfer,
        );
      });
      it('setTimeout should be called one time', () => {
        jest.useFakeTimers();
        const emoji = { colons: ':baby::skin-tone-2:' };
        messageInputViewModel.insertEmoji(emoji);
        expect(setTimeout).toHaveBeenCalledTimes(1);
      });
    });
  });
});
