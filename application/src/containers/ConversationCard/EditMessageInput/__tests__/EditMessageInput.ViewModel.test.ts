/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
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

const mockPostEntityData = {
  id: 1,
  groupId: 1,
  text: 'text',
};

const mockGroupEntityData = {
  id: 1,
  membersExcludeMe: [1],
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

const { PostService } = service;
const postService = {
  modifyPost: jest.fn(),
};
PostService.getInstance = jest.fn().mockReturnValue(postService);

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
  describe('_group', () => {
    it('should return group', () => {
      expect(editMessageInputViewModel._group).toBe(mockGroupEntityData);
    });
  });
  describe('_membersExcludeMe', () => {
    it('should return membersExcludeMe', () => {
      expect(editMessageInputViewModel._membersExcludeMe).toBe(
        mockGroupEntityData.membersExcludeMe,
      );
    });
  });
  describe('_users', () => {
    it('should return users', () => {
      expect(editMessageInputViewModel._users).toEqual([
        {
          id: 1,
          display: 'userName',
        },
      ]);
    });
  });
  describe('_enterHandler', () => {
    const mockThis = (content: string) => {
      const that = {
        quill: {
          getText: jest.fn().mockReturnValue(content),
          getContents: jest.fn(),
        },
      };
      return that;
    };

    it('should edit post success', () => {
      const content = 'text';
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.modifyPost).toBeCalled();
    });
    it('should edit post failure when content is empty', () => {
      const content = '';
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(postService.modifyPost).not.toBeCalled();
    });
    it('should edit post failure when content is illegal', () => {
      const content = CONTENT_ILLEGAL;
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
      expect(postService.modifyPost).not.toBeCalled();
    });
    it('should edit post failure when content is over length', () => {
      const content = _.pad('test', CONTENT_LENGTH + 1);
      const that = mockThis(content);
      // @ts-ignore
      markdownFromDelta = jest.fn().mockReturnValue(content);
      const handler = enterHandler.bind(that);
      handler();
      expect(editMessageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
      expect(postService.modifyPost).not.toBeCalled();
    });

    it('should edit post failure when service error', () => {
      postService.modifyPost = jest
        .fn()
        .mockRejectedValueOnce(new Error('error'));
      const content = 'text';
      const that = mockThis(content);
      const handler = enterHandler.bind(that);
      const result = handler();
      expect(result).toBeUndefined();
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
