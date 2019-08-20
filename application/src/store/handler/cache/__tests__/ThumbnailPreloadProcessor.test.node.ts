/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 18:37:10
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadProcessor } from '../ThumbnailPreloadProcessor';
import {
  SequenceProcessorHandler,
  SingletonSequenceProcessor,
} from 'sdk/framework/processor';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { ItemService } from 'sdk/module/item';
import { mainLogger } from 'foundation/log';
import { ServiceLoader } from 'sdk/module/serviceLoader';

describe('ThumbnailPreloadProcessor', () => {
  let thumbnailPreloadProcessor: ThumbnailPreloadProcessor;
  let _sequenceProcessorHandler: SequenceProcessorHandler;
  beforeEach(() => {
    _sequenceProcessorHandler = SingletonSequenceProcessor.getSequenceProcessorHandler(
      { name: 'test' },
    );
    thumbnailPreloadProcessor = new ThumbnailPreloadProcessor(
      _sequenceProcessorHandler,
      { id: 1 },
    );
  });

  describe('process', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call preload with thumbnail url', async () => {
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
      ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      spy.mockImplementationOnce(() => {});
      await thumbnailPreloadProcessor.process();
      expect(spy).toHaveBeenCalledWith({
        id: 1,
        url: 'https://glipasialabnet-xmnup66666',
      });
    });

    it.each`
      imageType
      ${'jpg'}
      ${'png'}
      ${'jpeg'}
      ${'bmp'}
      ${'tif'}
      ${'tiff'}
    `(
      'should call preload when imageType is $imageType',
      async ({ imageType, expected }) => {
        const fileItem: FileItem = {
          created_at: 1,
          modified_at: 1,
          creator_id: 1,
          is_new: false,
          deactivated: false,
          version: 1,
          id: 1,
          type: imageType,
          type_id: 1,
          source: 'upload',
          company_id: 122,
          name: `doc.${imageType}`,
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
        ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
        itemService.getById.mockResolvedValue(fileItem);

        const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
        spy.mockImplementationOnce(() => {});
        await thumbnailPreloadProcessor.process();
        expect(spy).toHaveBeenCalledWith({
          id: 1,
          url: 'https://glipasialabnet-xmnup66666',
        });
      },
    );

    it.each`
      imageType
      ${'giphy'}
      ${'ps'}
      ${'gif'}
      ${'heic'}
    `(
      'should not call preload when imageType is $imageType',
      async ({ imageType, expected }) => {
        const fileItem: FileItem = {
          created_at: 1,
          modified_at: 1,
          creator_id: 1,
          is_new: false,
          deactivated: false,
          version: 1,
          id: 1,
          type: imageType,
          type_id: 1,
          source: 'upload',
          company_id: 122,
          name: `doc.${imageType}`,
          post_ids: [1],
          group_ids: [1],
          versions: [],
        };

        const itemService = {
          getById: jest.fn(),
        };
        ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
        itemService.getById.mockResolvedValue(fileItem);

        const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
        spy.mockImplementationOnce(() => {});
        await thumbnailPreloadProcessor.process();
        expect(spy).not.toHaveBeenCalled();
      },
    );

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
      ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const preloadSpy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      preloadSpy.mockImplementationOnce(() => {
        throw Error('error');
      });

      const mainLoggerSpy = jest.spyOn(mainLogger, 'warn');
      await thumbnailPreloadProcessor.process();
      expect(mainLoggerSpy).toHaveBeenCalledWith(
        'ThumbnailPreloadProcessor: process(): error=',
        'error',
      );
    });

    it('should not call preload when id < 0', async () => {
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
      ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
      itemService.getById.mockResolvedValue(fileItem);

      const spy = jest.spyOn(thumbnailPreloadProcessor, 'preload');
      spy.mockImplementationOnce(() => {});
      await thumbnailPreloadProcessor.process();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
