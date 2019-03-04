/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 18:37:10
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadProcessor } from '../ThumbnailPreloadProcessor';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { FileItem } from 'sdk/module/item/module/file/entity';

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
    it('should addProcessor of sequenceProcessorHandler', () => {
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
            thumbs: { string: '11112size=1000x200' },
          },
        ],
      };

      // ${version.stored_file_id}size=${width}x${height}
      const url = thumbnailPreloadProcessor.toThumbnailUrl(fileItem);
      expect(url);
    });
  });
});
