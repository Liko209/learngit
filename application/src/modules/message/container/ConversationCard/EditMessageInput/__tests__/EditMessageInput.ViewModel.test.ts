/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import {
  EditMessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
} from '../EditMessageInput.ViewModel';
import _ from 'lodash';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import storeManager from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { Notification } from '@/containers/Notification';
import { container, decorate, injectable } from 'framework';
import { MESSAGE_SERVICE } from '@/modules/message/interface/constant';
import { MessageService } from '@/modules/message/service';
import { MessageStore } from '@/modules/message/store';
Notification.flashToast = jest.fn();

decorate(injectable(), MessageService);
container.bind(MESSAGE_SERVICE).to(MessageService);
decorate(injectable(), MessageStore);
container.bind(MessageStore).to(MessageStore);
jest.mock('@/containers/Notification');

const mockPostEntityData = {
  id: 1,
  groupId: 1,
  text: 'text',
  itemIds: [],
};

const mockGroupEntityData = {
  id: 1,
  members: [1],
};

const mockPersonEntityData = {
  id: 1,
  userDisplayName: 'userName',
};

const mockEntity = {
  post: mockPostEntityData,
  group: mockGroupEntityData,
  person: mockPersonEntityData,
};

jest.mock('@/store/utils', () => ({
  getEntity: jest.fn(name => mockEntity[name]),
}));

const postService = {
  editSuccessPost: jest.fn(),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);

let editMessageInputViewModel: EditMessageInputViewModel;
let enterHandler: () => void;
beforeEach(() => {
  editMessageInputViewModel = new EditMessageInputViewModel({ id: 1 });
  enterHandler = editMessageInputViewModel.keyboardEventHandler.enter.handler;
  jest.clearAllMocks();
});

describe('EditMessageInputViewModel', () => {
  describe('_post', () => {
    it('should return post', () => {
      expect(editMessageInputViewModel._post).toBe(mockPostEntityData);
    });
  });
  describe('id', () => {
    it('should return id', () => {
      expect(editMessageInputViewModel.id).toBe(mockPostEntityData.id);
    });
  });
  describe('gid', () => {
    it('should return gid', () => {
      expect(editMessageInputViewModel.gid).toBe(mockPostEntityData.groupId);
    });
  });
  describe('text', () => {
    it('should return text', () => {
      expect(editMessageInputViewModel.text).toBe(mockPostEntityData.text);
    });
  });
  describe('_enterHandler', () => {
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

    it('should edit post success', () => {
      const markdownFromDeltaRes = {
        content: 'text',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.editSuccessPost).toBeCalled();
    });
    it('should edit post failure when content and itemIds is empty', () => {
      const markdownFromDeltaRes = {
        content: '',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.editSuccessPost).not.toBeCalled();
    });
    it('should edit post failure when content is illegal', () => {
      const markdownFromDeltaRes = {
        content: CONTENT_ILLEGAL,
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
      expect(postService.editSuccessPost).not.toBeCalled();
    });
    it('should edit post failure when content is over length', () => {
      const markdownFromDeltaRes = {
        content: _.pad('test', CONTENT_LENGTH + 1),
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      handler();
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
      expect(postService.editSuccessPost).not.toBeCalled();
    });
    it('should edit post failure when service error', () => {
      postService.editSuccessPost = jest
        .fn()
        .mockRejectedValueOnce(new Error('error'));
      const content = 'text';
      const that = mockThis(content);
      const handler = enterHandler.bind(that);
      const result = handler();
      expect(result).toBeUndefined();
    });
    it('Failed to edit post due to network disconnection. [JPT-1824]', async () => {
      postService.editSuccessPost = jest.fn().mockImplementationOnce(() => {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      });

      const markdownFromDeltaRes = {
        content: 'text',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      await handler();
      expect(postService.editSuccessPost).toBeCalled();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.editPostFailedForNetworkIssue',
        }),
      );
    });
    it('Failed to edit post due to unexpected backend issue. [JPT-1823]', async () => {
      postService.editSuccessPost = jest.fn().mockImplementationOnce(() => {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      });

      const markdownFromDeltaRes = {
        content: 'text',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      const handler = enterHandler.bind(that);
      await handler();
      expect(postService.editSuccessPost).toBeCalled();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.editPostFailedForServerIssue',
        }),
      );
    });
  });

  describe('_escHandler()', () => {
    it('should call _exitEditMode', () => {
      editMessageInputViewModel._exitEditMode = jest.fn();
      editMessageInputViewModel._escHandler()();
      expect(editMessageInputViewModel._exitEditMode).toBeCalled();
    });
  });

  describe('_exitEditMode()', () => {
    it('should exit edit mode [JPT-479]', () => {
      editMessageInputViewModel._exitEditMode();
      const globalStore = storeManager.getGlobalStore();
      expect(
        globalStore
          .get(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS)
          .includes(editMessageInputViewModel.id),
      ).toBeFalsy();
    });
  });
});
