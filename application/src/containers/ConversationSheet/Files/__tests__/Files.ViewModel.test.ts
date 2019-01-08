/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../store/utils';
import { FilesViewModel } from '../Files.ViewModel';
import { service } from 'sdk';
jest.mock('../../../../store/utils');
import { FileType } from '../types';
import { Notification } from '@/containers/Notification';
jest.mock('@/containers/Notification');

const { ItemService, PostService } = service;
const itemService = {
  cancelUpload: jest.fn(),
};
ItemService.getInstance = jest.fn().mockReturnValue(itemService);
Notification.flashToast = jest.fn().mockImplementationOnce(() => {});

const postService = {
  removeItemFromPost: jest.fn(),
};
PostService.getInstance = jest.fn().mockReturnValue(postService);

const filesItemVM = new FilesViewModel();
filesItemVM.props.ids = [1, 2, 3];

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
    expect(filesItemVM._ids).toEqual([1, 2, 3]);
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
      await filesItemVM.removeFile(123, false);
      expect(postService.removeItemFromPost).toBeCalledTimes(1);
    });

    it('should show service error', async () => {
      (postService.removeItemFromPost as jest.Mock).mockImplementationOnce(
        () => {
          throw new Error('error');
        },
      );
      await filesItemVM.removeFile(123, false);
      const p = new Promise((resolve: any) => {
        setTimeout(() => {
          expect(Notification.flashToast).toHaveBeenCalled();
          resolve();
        },         0);
      });
      await p;
    });

    it('should show network error', async () => {
      (getGlobalValue as jest.Mock).mockImplementationOnce(() => 'offline');
      await filesItemVM.removeFile(123, false);
      const p = new Promise((resolve: any) => {
        setTimeout(() => {
          expect(Notification.flashToast).toHaveBeenCalled();
          resolve();
        },         0);
      });
      await p;
    });

    it('should cancel upload file', async () => {
      await filesItemVM.removeFile(123, true);
      expect(itemService.cancelUpload).toBeCalledTimes(1);
    });
  });
});
