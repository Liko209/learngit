/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 18:37:10
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadProcessor } from '../ThumbnailPreloadProcessor';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { ItemService } from 'sdk/module/item';
import { mainLogger } from 'sdk';

describe('ThumbnailPreloadProcessor', () => {
  let thumbnailPreloadProcessor: ThumbnailPreloadProcessor;
  let _sequenceProcessorHandler: SequenceProcessorHandler;
  beforeEach(() => {
    _sequenceProcessorHandler = new SequenceProcessorHandler('test');
    thumbnailPreloadProcessor = new ThumbnailPreloadProcessor(
      _sequenceProcessorHandler,
      { id: 1 },
    );
  });

  describe('toThumbnailUrl', () => {
    it('should return correct thumbnail url', () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 10,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [
          {
            download_url: 'https://glipasialabnet-xmnup',
            size: 613850,
            url: 'https://glipasialabnet-xmnup',
            stored_file_id: 11112,
            orig_width: 1000,
            orig_height: 200,
            thumbs: {
              '11112size=1000x200': 'https://glipasialabnet-xmnup66666',
            },
          },
        ],
      };

      // ${version.stored_file_id}size=${width}x${height}
      const url = thumbnailPreloadProcessor.toThumbnailUrl(fileItem);
      expect(url).toEqual({
        thumbnail: true,
        url: 'https://glipasialabnet-xmnup66666',
      });
    });

    it('should return original url when thumb is nil', () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 10,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [
          {
            download_url: 'https://glipasialabnet-xmnup',
            size: 613850,
            url: 'https://glipasialabnet-xmnup',
            stored_file_id: 11112,
            orig_width: 1000,
            orig_height: 200,
          },
        ],
      };

      // ${version.stored_file_id}size=${width}x${height}
      const url = thumbnailPreloadProcessor.toThumbnailUrl(fileItem);
      expect(url).toEqual({
        thumbnail: false,
        url: 'https://glipasialabnet-xmnup',
      });
    });

    it('should return original url when width/height is undefined', () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 10,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [
          {
            download_url: 'https://glipasialabnet-xmnup',
            size: 613850,
            url: 'https://glipasialabnet-xmnup',
            stored_file_id: 11112,
          },
        ],
      };

      // ${version.stored_file_id}size=${width}x${height}
      const url = thumbnailPreloadProcessor.toThumbnailUrl(fileItem);
      expect(url).toEqual({
        thumbnail: false,
        url: 'https://glipasialabnet-xmnup',
      });
    });

    it('should return null when versions is empty', () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 10,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [],
      };
      // ${version.stored_file_id}size=${width}x${height}
      const url = thumbnailPreloadProcessor.toThumbnailUrl(fileItem);
      expect(url).toEqual(null);
    });
  });

  describe('process', () => {
    it('should preload', async () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 1,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [
          {
            download_url: 'https://glipasialabnet-xmnup',
            size: 613850,
            url: 'https://glipasialabnet-xmnup',
            stored_file_id: 11112,
            orig_width: 1000,
            orig_height: 200,
            thumbs: {
              '11112size=1000x200': 'https://glipasialabnet-xmnup66666',
            },
          },
        ],
      };

      const itemService = {
        getById: jest.fn(),
      };
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      spy.mockImplementationOnce(() => {});
      await thumbnailPreloadProcessor.process();
      expect(spy).toBeCalledWith({
        id: 1,
        url: 'https://glipasialabnet-xmnup66666',
        thumbnail: true,
      });
    });

    it('should not crash', async () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: 1,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [
          {
            download_url: 'https://glipasialabnet-xmnup',
            size: 613850,
            url: 'https://glipasialabnet-xmnup',
            stored_file_id: 11112,
            orig_width: 1000,
            orig_height: 200,
            thumbs: {
              '11112size=1000x200': 'https://glipasialabnet-xmnup66666',
            },
          },
        ],
      };

      const itemService = {
        getById: jest.fn(),
      };
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const preloadSpy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      preloadSpy.mockImplementationOnce(() => {
        throw Error('error');
      });

      const mainLoggerSpy = jest.spyOn(mainLogger, 'warn');
      await thumbnailPreloadProcessor.process();
      expect(mainLoggerSpy).toBeCalledWith(
        'ThumbnailPreloadProcessor: process(): error=',
        'error',
      );
    });

    it('should not call preload', async () => {
      const fileItem: FileItem = {
        created_at: 1,
        modified_at: 1,
        creator_id: 1,
        is_new: false,
        deactivated: false,
        version: 1,
        id: -1,
        type: 'jpg',
        type_id: 1,
        source: 'upload',
        company_id: 122,
        name: 'doc.jpg',
        post_ids: [1],
        group_ids: [1],
        versions: [],
      };

      const itemService = {
        getById: jest.fn(),
      };
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      spy.mockImplementationOnce(() => {});
      await thumbnailPreloadProcessor.process();
      expect(spy).not.toBeCalled();
    });
  });
});
