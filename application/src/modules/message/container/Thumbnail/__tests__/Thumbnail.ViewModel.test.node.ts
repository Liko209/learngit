/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ThumbnailViewModel } from '../Thumbnail.ViewModel';
import * as getThumbnailURL from '@/common/getThumbnailURL';
import { observable } from 'mobx';

jest.mock('@/store/utils');
jest.mock('@/common/getFileType');
jest.mock('sdk/module/item/service');

let thumbnailViewModel: ThumbnailViewModel;

const previewUrl = 'http://www.google.com';

describe('ThumbnailViewModel', () => {
  describe('_getThumbsUrlWithSize()', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest
        .spyOn(getThumbnailURL, 'getThumbnailURLWithType')
        .mockResolvedValue({ url: previewUrl, type: 1 });
    });
    it('should get thumbsUrlWithSize for image', done => {
      const file = {
        type: 'application/json',
        latestVersion: { stored_file_id: 1 },
      };

      (getEntity as jest.Mock).mockReturnValue(file);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123, type: 'image' });
      setTimeout(() => {
        expect(thumbnailViewModel.thumbsUrlWithSize).toEqual(previewUrl);
        file.latestVersion = { stored_file_id: 1 };
        setTimeout(() => {
          expect(thumbnailViewModel.thumbsUrlWithSize).toEqual(previewUrl);
          done();
        });
      });
    });

    it('should not have thumbsUrlWithSize for file', done => {
      const file = {
        type: 'application/json',
        latestVersion: { stored_file_id: 1 },
      };

      (getEntity as jest.Mock).mockReturnValue(file);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123, type: 'file' });
      setTimeout(() => {
        expect(thumbnailViewModel.thumbsUrlWithSize).toBeUndefined();
        done();
      });
    });

    it('should get file type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'doc',
        iconType: 'doc',
        versions: [],
      });

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('doc');
    });
    it('should get default type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: '',
        iconType: 'default_file',
        versions: [],
      });

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('default_file');
    });
    it('should get default type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: '',
        iconType: 'default_file',
        versions: [],
      });

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('default_file');
    });
    it('should the last url when versions store id is same as the last store id', async () => {
      const storeFileId = 111;
      const thumbUrl = 'https://www.google.com';
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ stored_file_id: storeFileId }],
      });

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      thumbnailViewModel._lastStoreFileId = storeFileId;
      thumbnailViewModel.thumbsUrlWithSize = thumbUrl;

      expect(thumbnailViewModel.thumbsUrlWithSize).toEqual(thumbUrl);
    });
    it('should recall _getThumbsUrlWithSize when file versions length has been changed', done => {
      const file = observable({
        type: 'application/json',
        latestVersion: { stored_file_id: 1 },
      });

      (getEntity as jest.Mock).mockReturnValue(file);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123, type: 'image' });
      setTimeout(() => {
        expect(thumbnailViewModel._lastStoreFileId).toEqual(1);

        file.latestVersion = { stored_file_id: 2 };
        setTimeout(() => {
          expect(thumbnailViewModel._lastStoreFileId).toEqual(2);
          done();
        });
      });
    });
  });
});
