/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../store/utils';
import { FilesViewModel } from '../Files.ViewModel';

import { FileType, FilesViewProps } from '../types';
import { Notification } from '@/containers/Notification';
import { PROGRESS_STATUS } from 'sdk/module/progress';
import { ItemService } from 'sdk/module/item';
import { PostService } from 'sdk/module/post';
import FileItemModel from '@/store/models/FileItem';

jest.mock('sdk/module/post');
jest.mock('../../../../store/utils');
jest.mock('@/containers/Notification');

const itemService = {
  cancelUpload: jest.fn(),
};
ItemService.getInstance = jest.fn().mockReturnValue(itemService);

const postService = new PostService();
PostService.getInstance = jest.fn().mockReturnValue(postService);

ItemService.getInstance = jest.fn().mockReturnValue({});
Notification.flashToast = jest.fn().mockImplementationOnce(() => {});

const mockItemValue = {
  name: 'filename',
  id: 1,
  pages: [
    {
      file_id: 11,
      url: 'http://www.xxx.com',
    },
  ],
};

(getEntity as jest.Mock).mockReturnValue({
  ...mockItemValue,
});

const filesItemVM = new FilesViewModel({ ids: [1, 2, -3] });

function waitResult(callback: Function) {
  return new Promise((resolve: any) => {
    setTimeout(() => {
      callback();
      resolve();
    },         0);
  });
}

describe('filesItemVM', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockReturnValue({
      ...mockItemValue,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('get _ids', () => {
    expect(filesItemVM._ids).toEqual([1, 2, -3]);
  });

  it('get files', () => {
    expect(filesItemVM.files).toEqual({
      [FileType.image]: [],
      [FileType.document]: [
        { item: mockItemValue, type: 1, previewUrl: 'http://www.xxx.com' },
        { item: mockItemValue, type: 1, previewUrl: 'http://www.xxx.com' },
        { item: mockItemValue, type: 1, previewUrl: 'http://www.xxx.com' },
      ],
      [FileType.others]: [],
    });
  });

  it('get items', () => {
    expect(filesItemVM.items).toMatchObject([
      {
        ...mockItemValue,
      },
      { ...mockItemValue },
      { ...mockItemValue },
    ]);
  });

  describe('removeFile()', () => {
    it('should call post service', async () => {
      await filesItemVM.removeFile(123);
      expect(postService.removeItemFromPost).toBeCalledTimes(1);
    });

    it('should show service error', async () => {
      (postService.removeItemFromPost as jest.Mock).mockImplementationOnce(
        () => {
          throw new Error('error');
        },
      );
      await filesItemVM.removeFile(123);
      await waitResult(() =>
        expect(Notification.flashToast).toHaveBeenCalled(),
      );
    });

    it('should show network error', async () => {
      (getGlobalValue as jest.Mock).mockImplementationOnce(() => 'offline');
      await filesItemVM.removeFile(123);
      await waitResult(() =>
        expect(Notification.flashToast).toHaveBeenCalled(),
      );
    });

    it('should cancel upload file', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        ...mockItemValue,
        progressStatus: PROGRESS_STATUS.INPROGRESS,
      });
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      const vm = new FilesViewModel({ ids: [123, 2, 3] } as FilesViewProps);
      await vm.removeFile(123);
      await waitResult(() =>
        expect(itemService.cancelUpload).toBeCalledTimes(1),
      );
    });
  });

  describe('getCropImage', () => {
    const imageItem: FileItemModel = {
      name: 'a.png',
      id: 1,
      type: 'png',
      isNew: true,
      deactivated: false,
      versionUrl: 'a-version-url',
      versions: [],
    } as FileItemModel;

    beforeEach(() => filesItemVM.urlMap.clear());

    it('should fallback url to versionUrl for multiple images', async () => {
      filesItemVM.files[0] = [
        {
          item: imageItem,
          type: 10,
        },
      ];
      await filesItemVM.getCropImage();
      await waitResult(() =>
        expect(filesItemVM.urlMap.get(imageItem.id)).toEqual(
          imageItem.versionUrl,
        ),
      );
    });

    it('should get undefined url when type invalid', async () => {
      const invalidItem: FileItemModel = {
        type: 0,
      } as FileItemModel;
      filesItemVM.files[0] = [
        {
          item: invalidItem,
          type: 10,
        },
      ];
      await filesItemVM.getCropImage();
      await waitResult(() =>
        expect(filesItemVM.urlMap.get(imageItem.id)).toBeUndefined(),
      );
    });

    it('should use version url for gif file', async () => {
      const gifItem: FileItemModel = {
        type: 'gif',
        versionUrl: 'gif-url',
        id: 456,
        versions: [],
      } as FileItemModel;
      filesItemVM.files[0] = [
        {
          item: gifItem,
          type: 10,
        },
      ];
      await filesItemVM.getCropImage();
      await waitResult(() =>
        expect(filesItemVM.urlMap.get(gifItem.id)).toEqual(gifItem.versionUrl),
      );
    });
  });
});
