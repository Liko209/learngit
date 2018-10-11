/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH } from '../MessageInput.ViewModel';
import { getEntity } from '../../../../store/utils';
import { markdownFromDelta } from '../../../../../../packages/ui-components/src/MessageInput';
import _ from 'lodash';

const { PostService, GroupService } = service;
const postService = {
  sendPost: jest.fn(),
};
const groupService = {
  updateGroupDraft: jest.fn(),
};
PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

const mockGroupEntityData = {
  draft: 'draft',
};
// @ts-ignore
getEntity = jest.fn().mockReturnValue(mockGroupEntityData);

const messageInputViewModel = new MessageInputViewModel();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ActionsViewModel', () => {
  it('lifecycle onReceiveProps method', () => {
    let id = 123;
    messageInputViewModel.onReceiveProps({ id });
    expect(messageInputViewModel._id).toBe(id);
    id = 456;
    messageInputViewModel.onReceiveProps({ id });
    expect(messageInputViewModel.draft).toBe(mockGroupEntityData.draft);
  });

  it('method changeDraft', () => {
    const draft = 'test';
    messageInputViewModel.changeDraft(draft);
    expect(messageInputViewModel.draft).toBe(draft);
  });

  it('method forceSaveDraft', () => {
    messageInputViewModel.forceSaveDraft();
    expect(groupService.updateGroupDraft).toBeCalled();
  });

  it('get computed _initDraft', () => {
    expect(messageInputViewModel._initDraft).toBe(mockGroupEntityData.draft);
  });
});

describe('ActionsViewModel send post', () => {
  const mockThis = (content: string) => {
    const that = {
      quill: {
        getText: jest.fn().mockReturnValue(content),
        getContents: jest.fn(),
      },
    };
    return that;
  };

  it('send post should be success', () => {
    const content = 'text';
    const that = mockThis(content);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = messageInputViewModel.keyboardEventHandler.enter.handler.bind(that);
    handler();
    expect(messageInputViewModel.draft).toBe('');
    expect(postService.sendPost).toBeCalled();
  });

  it('send post should be illegal error', () => {
    const content = CONTENT_ILLEGAL;
    const that = mockThis(content);
    const handler = messageInputViewModel.keyboardEventHandler.enter.handler.bind(that);
    handler();
    expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
  });

  it('send post should be length error', () => {
    const content = _.pad('test', CONTENT_LENGTH + 1);
    const that = mockThis(content);
    const handler = messageInputViewModel.keyboardEventHandler.enter.handler.bind(that);
    handler();
    expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
  });
});
