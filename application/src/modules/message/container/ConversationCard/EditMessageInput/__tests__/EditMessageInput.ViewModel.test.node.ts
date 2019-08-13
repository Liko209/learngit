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
import { jupiter} from 'framework/Jupiter';
import { IMessageService, IMessageStore } from '@/modules/message/interface';
import { MessageService } from '@/modules/message/service';
import { MessageStore } from '@/modules/message/store';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';

jest.mock('@/containers/Notification');
jest.mock('jui/pattern/MessageInput/markdown');

Notification.flashToast = jest.fn();
jupiter.registerService(IMessageService, MessageService);
jupiter.registerService(IMessageStore, MessageStore);

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
  getEntity: name => mockEntity[name],
}));

const postService = {
  editPost: jest.fn(),
};
ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);

let editMessageInputViewModel: EditMessageInputViewModel;
let enterHandler: () => void;

beforeEach(() => {
  ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
  editMessageInputViewModel = new EditMessageInputViewModel({ id: 1 });
  enterHandler = editMessageInputViewModel.keyboardEventHandler.enter.handler;
});

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
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

    const element = {
      quill: {
        getText: jest.fn(),
        getContents: jest.fn(),
      },
    }

    it('should edit post success', () => {
      markdownFromDelta.mockReturnValue({
        content: 'Text',
        mentionsIds: [],
      });
      editMessageInputViewModel.keyboardEventHandler.enter.handler.call(element);
      expect(postService.editPost).toBeCalled();
    });

    it('should edit post failure when content and itemIds is empty', () => {
      markdownFromDelta.mockReturnValue({
        content: '',
        mentionsIds: [],
      });
      editMessageInputViewModel.keyboardEventHandler.enter.handler.call(element);
      expect(postService.editPost).not.toBeCalled();
    });
    it('Delete the message after deleting all content in edit box. [JPT-2547]', () => {
      const markdownFromDeltaRes = {
        content: '',
        mentionsIds: [],
      };
      const that = mockThis(markdownFromDeltaRes);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
      jest.spyOn(editMessageInputViewModel, '_handleDelete');
      const handler = enterHandler.bind(that);
      handler();
      expect(editMessageInputViewModel._handleDelete).toBeCalled();
    });
    it('should edit post failure when content is illegal', () => {
      markdownFromDelta.mockReturnValue({
        content: CONTENT_ILLEGAL,
        mentionsIds: [],
      });
      editMessageInputViewModel.keyboardEventHandler.enter.handler.call(element);
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
      expect(postService.editPost).not.toBeCalled();
    });

    it('should edit post failure when content is over length', () => {
      markdownFromDelta.mockReturnValue({
        content: _.pad('test', CONTENT_LENGTH + 1),
        mentionsIds: [],
      });
      editMessageInputViewModel.keyboardEventHandler.enter.handler.call(element);
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
      expect(postService.editPost).not.toBeCalled();
    });

    it('Failed to edit post due to network disconnection. [JPT-1824]', async () => {
      postService.editPost.mockImplementation(async () => {
        throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
      });
      markdownFromDelta.mockReturnValue({
        content: 'text',
        mentionsIds: [],
      });
      await editMessageInputViewModel['_handleEditPost']('', []);
      expect(postService.editPost).toBeCalled();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.editPostFailedForNetworkIssue',
        }),
      );
    });

    it('Failed to edit post due to unexpected backend issue. [JPT-1823]', async () => {
      postService.editPost.mockImplementation(async () => {
        throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
      });
      markdownFromDelta.mockReturnValue({
        content: 'text',
        mentionsIds: [],
      });
      await editMessageInputViewModel['_handleEditPost']('', []);
      expect(postService.editPost).toBeCalled();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'message.prompt.editPostFailedForServerIssue',
        }),
      );
    });
  });

  describe('_escHandler()', () => {
    it('should removeDraft', () => {
      jest.spyOn(editMessageInputViewModel, 'removeDraft');
      editMessageInputViewModel.keyboardEventHandler.escape.handler();
      expect(editMessageInputViewModel.removeDraft).toBeCalled();
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
