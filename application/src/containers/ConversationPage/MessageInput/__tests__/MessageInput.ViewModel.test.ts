/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-11 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { ItemFile } from 'sdk/models';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
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

const { PostService, GroupService, ItemService } = service;
const postService = {
  sendPost: jest.fn(),
};
const groupService = {
  updateGroupDraft: jest.fn(),
};

let fileIDs: number = -1001;
let _uploadingItems: ItemFile[] = [];
let _uploadedItems: ItemFile[] = [];

function mockUpload() {
  if (_uploadingItems.length > 0) {
    const firstItem = _uploadingItems[0];
    setTimeout(() => {
      firstItem.id = -firstItem.id;
      _uploadedItems.push(firstItem);
      _uploadingItems.splice(0, 1);
    },         3 * 1000);
  }
}

const itemService = {
  sendItemFile: jest
    .fn()
    .mockImplementation(
      (groupId: number, file: FormData, isUpdate: boolean) => {
        const itemfile = {
          file,
          isUpdate,
          name: file.get(FILE_FORM_DATA_KEYS.FILE_NAME),
          id: fileIDs,
          group_ids: [groupId],
        };
        --fileIDs;
        _uploadingItems.push(itemfile as any);
        mockUpload();
        return itemfile as any;
      },
    ),

  cancelUpload: jest.fn().mockImplementation((itemId: number) => {
    if (itemId >= 0) {
      return;
    }
    const index = _uploadingItems.findIndex(item => item.id === itemId);
    if (index >= 0) {
      _uploadingItems.splice(index, 1);
    }
  }),
  isFileExists: jest
    .fn()
    .mockImplementation(async (groupId: number, fileName: string) => {
      if (groupId <= 0 || !fileName || fileName.trim().length === 0) {
        return false;
      }
      let index = _uploadingItems.findIndex(
        item => item.group_ids.includes(groupId) && item.name === fileName,
      );
      if (index >= 0) {
        return true;
      }
      index = _uploadedItems.findIndex(
        item => item.group_ids.includes(groupId) && item.name === fileName,
      );
      return index >= 0;
    }),
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

  it('get computed _initDraft is empty', () => {
    mockGroupEntityData.draft = '';
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

  const enterHandler = messageInputViewModel.keyboardEventHandler.enter.handler;

  it.skip('send post should be success', () => {
    const content = 'text';
    const that = mockThis(content);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = enterHandler.bind(that);
    handler();
    expect(messageInputViewModel.draft).toBe('');
    expect(postService.sendPost).toBeCalled();
  });

  it('send post content is empty should be not send', () => {
    const content = '';
    const that = mockThis(content);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = enterHandler.bind(that);
    handler();
    expect(postService.sendPost).toBeCalledTimes(0);
  });

  it('send post should be illegal error', () => {
    const content = CONTENT_ILLEGAL;
    const that = mockThis(content);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = enterHandler.bind(that);
    handler();
    expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_ILLEGAL);
  });

  it('send post should be over length error', () => {
    const content = _.pad('test', CONTENT_LENGTH + 1);
    const that = mockThis(content);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = enterHandler.bind(that);
    handler();
    expect(messageInputViewModel.error).toBe(ERROR_TYPES.CONTENT_LENGTH);
  });

  it('send post should be service error', () => {
    postService.sendPost = jest.fn().mockRejectedValueOnce(new Error('error'));
    const content = 'text';
    const that = mockThis(content);
    const handler = enterHandler.bind(that);
    const result = handler();
    expect(result).toBeUndefined();
  });
});

describe('Send files with Post', () => {
  const mockThis = (content: string) => {
    const that = {
      quill: {
        getText: jest.fn().mockReturnValue(content),
        getContents: jest.fn(),
      },
    };
    return that;
  };

  const file = new File(['foo'], 'foo.txt', {
    type: 'text/plain',
  });

  const vm = new MessageInputViewModel({ id: 456 });
  const enterHandler = vm.keyboardEventHandler.enter.handler;
  beforeEach(() => {
    vm.items = [];
    vm.files = [];
    vm.duplicateFiles = [];
    vm.uniqueFiles = [];
    _uploadedItems = [];
    _uploadingItems = [];
  });

  it('send post content is empty but with files should be send', async () => {
    const content = '';
    const that = mockThis(content);
    await vm.autoUploadFile([file]);
    // @ts-ignore
    markdownFromDelta = jest.fn().mockReturnValue(content);
    const handler = enterHandler.bind(that);
    handler();
    expect(postService.sendPost).toBeCalledTimes(1);
  });

  it('autoUploadFile() will do nothing if no files', async () => {
    await vm.autoUploadFile([]);
    expect(itemService.sendItemFile).toBeCalledTimes(0);
  });

  it('autoUploadFile() will upload files', async () => {
    const item = await vm.autoUploadFile([file]);
    expect(vm.duplicateFiles.length).toBe(0);
    expect(itemService.sendItemFile).toBeCalledTimes(1);
    const result = await vm.isFileExists(file);
    expect(result).toBe(true);
    // will check duplicate
    await vm.autoUploadFile([file]);
    expect(itemService.sendItemFile).toBeCalledTimes(1);
  });

  it('uploadFile() can upload a file', async () => {
    await vm.uploadFile(file, false);
    expect(vm.items.length).toBe(1);
    expect(itemService.sendItemFile).toBeCalledTimes(1);
    const exists = await itemService.isFileExists(vm.id, file.name);
    expect(exists).toBe(true);
  });

  it('cancelUploadFile() can cancel uploading file', async () => {
    await vm.autoUploadFile([file]);
    let exists = await itemService.isFileExists(vm.id, file.name);
    expect(exists).toBe(true);
    expect(vm.files.length).toBe(1);
    expect(vm.items.length).toBe(1);

    await vm.cancelUploadFile(file);
    expect(itemService.cancelUpload).toBeCalledTimes(1);

    exists = await itemService.isFileExists(vm.id, file.name);
    expect(exists).toBe(false);
  });

  it('should cancelDuplicateFiles() when user choose cancel upload duplicate files, clear them',  async () => {
    await vm.autoUploadFile([file]);
    await vm.autoUploadFile([file]);
    expect(vm.duplicateFiles.length).toBe(1);
    vm.cancelDuplicateFiles();
    expect(vm.duplicateFiles.length).toBe(0);
  });

  it('should uploadDuplicateFiles()', async () => {
    const f2 = new File(['bar'], 'bar.txt', {
      type: 'text/plain',
    });
    await vm.autoUploadFile([file]);
    await  vm.autoUploadFile([f2]);
    expect(vm.duplicateFiles.length).toBe(0);
    await vm.autoUploadFile([f2]);
    expect(vm.duplicateFiles.length).toBe(1);
    await vm.uploadDuplicateFiles();
    expect(vm.duplicateFiles.length).toBe(0);
    await vm.autoUploadFile([file, f2]);
    expect(vm.duplicateFiles.length).toBe(2);
    await vm.uploadDuplicateFiles();
    expect(vm.duplicateFiles.length).toBe(0);
  });

  it('should updateDuplicateFiles()', async () => {
    const f2 = new File(['bar'], 'bar.txt', {
      type: 'text/plain',
    });
    await vm.autoUploadFile([file]);
    await  vm.autoUploadFile([f2]);
    expect(vm.duplicateFiles.length).toBe(0);
    await vm.autoUploadFile([f2]);
    expect(vm.duplicateFiles.length).toBe(1);
    await vm.updateDuplicateFiles();
    expect(itemService.sendItemFile).toBeCalledTimes(3);
    expect(vm.duplicateFiles.length).toBe(0);
    await vm.autoUploadFile([file, f2]);
    expect(vm.duplicateFiles.length).toBe(2);
    await vm.updateDuplicateFiles();
    expect(itemService.sendItemFile).toBeCalledTimes(5);
    expect(vm.duplicateFiles.length).toBe(0);
  });
});
