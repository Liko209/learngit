/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 10:55:29
 * Copyright © RingCentral. All rights reserved.
 */

import { Notification } from '@/containers/Notification';
import { ItemFile } from 'sdk/module/item/entity';
import { AttachmentsViewModel } from '../Attachments.ViewModel';
import { MessageInputViewModel } from '../../MessageInput.ViewModel';
import { SelectFile } from '../types';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('@/containers/Notification');
const mockGroupEntityData = {
  draft: 'draft',
};

jest.mock('@/store/utils', () => ({
  getEntity: jest.fn(() => mockGroupEntityData),
}));
jest.mock('sdk/api');

jest.mock('sdk/module/config');

const postService = {
  sendPost: jest.fn(),
};
const groupService = {
  updateGroupDraft: jest.fn(),
  sendTypingEvent: jest.fn(),
};
const groupConfigService = {
  updateDraft: jest.fn(),
  getDraft: jest.fn(),
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
    }, 3);
  }
}

const itemService = {
  sendItemFile: jest
    .fn()
    .mockImplementation((groupId: number, file: File, isUpdate: boolean) => {
      const itemfile = {
        file,
        isUpdate,
        name: file.name,
        id: fileIDs,
        group_ids: [groupId],
      };
      --fileIDs;
      _uploadingItems.push(itemfile as any);
      mockUpload();
      return itemfile as any;
    }),

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
  canUploadFiles: jest.fn().mockImplementation(() => true),
};

ServiceLoader.getInstance = jest
  .fn()
  .mockImplementation((serviceName: string) => {
    if (serviceName === ServiceConfig.POST_SERVICE) {
      return postService;
    }

    if (serviceName === ServiceConfig.GROUP_SERVICE) {
      return groupService;
    }

    if (serviceName === ServiceConfig.ITEM_SERVICE) {
      return itemService;
    }

    if (serviceName === ServiceConfig.GROUP_CONFIG_SERVICE) {
      return groupConfigService;
    }

    return null;
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AttachmentsViewModel', () => {
  const file = new File(['foo'], 'foo.txt', {
    type: 'text/plain',
  });

  let vm: AttachmentsViewModel;

  beforeEach(() => {
    vm = new AttachmentsViewModel({ id: 456, forceSaveDraft: true });
    _uploadedItems = [];
    _uploadingItems = [];
    fileIDs = -1001;
  });

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

    test.each(['', 'abc'])(
      'should send post with content `%s`',
      async (content1: string) => {
        const markdownFromDeltaRes = {
          content: content1,
          mentionsIds: [],
        };

        const messageInputViewModel = new MessageInputViewModel({
          id: 456,
          onUpArrowPressed: jest.fn(),
        });
        const vm1 = new AttachmentsViewModel({
          id: messageInputViewModel.id,
        });

        const enterHandler =
          messageInputViewModel.keyboardEventHandler.enter.handler;

        const that = mockThis(markdownFromDeltaRes);
        // @ts-ignore
        markdownFromDelta = jest.fn().mockReturnValue(markdownFromDeltaRes);
        await vm1.autoUploadFiles([file]);
        const handler = enterHandler.bind(that);
        handler();
        expect(postService.sendPost).toBeCalled();
      },
    );
  });

  describe('autoUploadFiles()', () => {
    it('should show flashToast if can not upload files', async () => {
      itemService.canUploadFiles.mockResolvedValueOnce(false);
      Notification.flashToast = jest.fn();
      await vm.autoUploadFiles([file]);
      expect(itemService.sendItemFile).toBeCalledTimes(0);
      expect(Notification.flashToast).toBeCalledTimes(1);
    });
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

    it('should not show duplicate dialog', async () => {
      await vm.autoUploadFiles([file], false);
      expect(vm.duplicateFiles.length).toBe(0);
      expect(vm.showDuplicateFiles).toBeFalsy();
    });
  });

  describe('uploadFile()', () => {
    it('should upload a file', async () => {
      const info: SelectFile = { data: file, duplicate: false };
      await vm.uploadFile(info, false);
      expect(vm.items.size).toBe(1);
      expect(itemService.sendItemFile).toBeCalledTimes(1);
      const exists = await itemService.isFileExists(vm.props.id, file.name);
      expect(exists).toBe(true);
    });
  });

  describe('cancelUploadFile()', () => {
    it('should cancel uploading file', async () => {
      await vm.autoUploadFiles([file]);
      let exists = await itemService.isFileExists(vm.props.id, file.name);
      expect(exists).toBe(true);
      expect(vm.files.length).toBe(1);
      expect(vm.items.size).toBe(1);
      const items = itemService.getUploadItems(vm.props.id);
      const item = items[0];
      await vm.cancelUploadFile({
        id: item.id,
        name: file.name,
        status: 'normal',
      } as ItemInfo);
      expect(itemService.cancelUpload).toBeCalledTimes(1);

      exists = await itemService.isFileExists(vm.props.id, file.name);
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

  describe('sendFilesOnlyPost()', () => {
    it('should send files only post', async () => {
      await vm.autoUploadFiles([file]);
      await vm.sendFilesOnlyPost();
      expect(postService.sendPost).toBeCalledTimes(1);
    });
  });

  describe('showDuplicateFiles()', () => {
    it('should showDuplicateFiles when duplicate upload files', async () => {
      await vm.autoUploadFiles([file]);
      await vm.autoUploadFiles([file]);
      expect(vm.showDuplicateFiles).toBe(true);
      expect(vm.duplicateFiles.length).toBe(1);
      expect(vm.duplicateFiles[0].name).toEqual(file.name);
    });

    it('should not showDuplicateFiles when duplicate upload files in different conversation JPT-452', async () => {
      await vm.autoUploadFiles([file]);
      const vm2 = new AttachmentsViewModel({ id: 789 });
      await vm2.autoUploadFiles([file]);
      expect(vm.showDuplicateFiles).toBe(false);
    });
  });

  describe('forceSaveDraftItems()', () => {
    beforeEach(() => {
      fileIDs = -1001;
    });
    it('should call forceSaveDraftItems after uploading a file', async () => {
      const info: SelectFile = { data: file, duplicate: false };
      jest.spyOn(vm, 'forceSaveDraftItems');
      await vm.uploadFile(info, false);
      expect(vm.forceSaveDraftItems).toHaveBeenCalled();
    });

    it('should call updateDraft with forceSaveDraftItems', async () => {
      const info: SelectFile = { data: file, duplicate: false };
      jest.spyOn(vm, 'forceSaveDraftItems');
      await vm.uploadFile(info, false);
      expect(groupConfigService.updateDraft).toHaveBeenCalledWith({
        attachment_item_ids: [fileIDs + 1],
        id: 456,
      });
    });
  });
});
