/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 10:55:29
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { ItemFile } from 'sdk/models';
import { FILE_FORM_DATA_KEYS } from 'sdk/service/item';
import { AttachmentsViewModel } from '../Attachments.ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { MessageInputViewModel } from '../../MessageInput.ViewModel';
import { SelectFile } from '../types';

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

  getUploadItems: jest.fn().mockImplementation(() => {
    return _uploadingItems.concat(_uploadedItems);
  }),
};

PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);
ItemService.getInstance = jest.fn().mockReturnValue(itemService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AttachmentsViewModel', () => {
  const file = new File(['foo'], 'foo.txt', {
    type: 'text/plain',
  });

  let vm: AttachmentsViewModel;

  beforeEach(() => {
    vm = new AttachmentsViewModel({ id: 456 });
    _uploadedItems = [];
    _uploadingItems = [];
  });

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

    test.each(['', 'abc'])(
      'should send post with content `%s`',
      async (content: string) => {
        const messageInputViewModel = new MessageInputViewModel({ id: 456 });
        const vm1 = new AttachmentsViewModel({
          id: messageInputViewModel.id,
        });

        const enterHandler =
          messageInputViewModel.keyboardEventHandler.enter.handler;

        const that = mockThis(content);
        // @ts-ignore
        markdownFromDelta = jest.fn().mockReturnValue(content);
        await vm1.autoUploadFiles([file]);
        const handler = enterHandler.bind(that);
        handler();
        expect(postService.sendPost).toBeCalled();
      },
    );
  });

  describe('autoUploadFiles()', () => {
    it('should do nothing if no files', async () => {
      await vm.autoUploadFiles([]);
      expect(itemService.sendItemFile).toBeCalledTimes(0);
    });

    it('should upload files', async () => {
      await vm.autoUploadFiles([file]);
      expect(vm.duplicateFiles.length).toBe(0);
      expect(itemService.sendItemFile).toBeCalledTimes(1);
      const result = await vm.isFileExists(file);
      expect(result).toBe(true);
      // will check duplicate
      await vm.autoUploadFiles([file]);
      expect(itemService.sendItemFile).toBeCalledTimes(1);
    });
  });

  describe('uploadFile()', () => {
    it('should upload a file', async () => {
      const info: SelectFile = { data: file, duplicate: false };
      await vm.uploadFile(info, false);
      expect(vm.items.size).toBe(1);
      expect(itemService.sendItemFile).toBeCalledTimes(1);
      const exists = await itemService.isFileExists(vm.id, file.name);
      expect(exists).toBe(true);
    });
  });

  describe('cancelUploadFile()', () => {
    it('should cancel uploading file', async () => {
      await vm.autoUploadFiles([file]);
      let exists = await itemService.isFileExists(vm.id, file.name);
      expect(exists).toBe(true);
      expect(vm.files.length).toBe(1);
      expect(vm.items.size).toBe(1);
      await vm.cancelUploadFile({
        name: file.name,
        status: 'normal',
      } as ItemInfo);
      expect(itemService.cancelUpload).toBeCalledTimes(1);

      exists = await itemService.isFileExists(vm.id, file.name);
      expect(exists).toBe(false);
    });
  });

  describe('cancelDuplicateFiles()', () => {
    it('should clear duplicate files when user choose cancel upload duplicate files', async () => {
      await vm.autoUploadFiles([file]);
      await vm.autoUploadFiles([file]);
      expect(vm.duplicateFiles.length).toBe(1);
      vm.cancelDuplicateFiles();
      expect(vm.duplicateFiles.length).toBe(0);
    });
  });

  describe('uploadDuplicateFiles()', () => {
    it('should force upload duplicate files as new ones', async () => {
      const f2 = new File(['bar'], 'bar.txt', {
        type: 'text/plain',
      });
      await vm.autoUploadFiles([file]);
      await vm.autoUploadFiles([f2]);
      expect(vm.duplicateFiles.length).toBe(0);
      await vm.autoUploadFiles([f2]);
      expect(vm.duplicateFiles.length).toBe(1);
      await vm.uploadDuplicateFiles();
      expect(vm.duplicateFiles.length).toBe(0);
      await vm.autoUploadFiles([file, f2]);
      expect(vm.duplicateFiles.length).toBe(2);
      await vm.uploadDuplicateFiles();
      expect(vm.duplicateFiles.length).toBe(0);
    });
  });

  describe('updateDuplicateFiles()', () => {
    it('should update duplicate files', async () => {
      const f2 = new File(['bar'], 'bar.txt', {
        type: 'text/plain',
      });
      await vm.autoUploadFiles([file]);
      await vm.autoUploadFiles([f2]);
      expect(vm.duplicateFiles.length).toBe(0);
      await vm.autoUploadFiles([f2]);
      expect(vm.duplicateFiles.length).toBe(1);
      await vm.updateDuplicateFiles();
      expect(itemService.sendItemFile).toBeCalledTimes(3);
      expect(vm.duplicateFiles.length).toBe(0);
      await vm.autoUploadFiles([file, f2]);
      expect(vm.duplicateFiles.length).toBe(2);
      await vm.updateDuplicateFiles();
      expect(itemService.sendItemFile).toBeCalledTimes(5);
      expect(vm.duplicateFiles.length).toBe(0);
    });
  });
});
