/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 19:05:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadController } from '../ThumbnailPreloadController';
import { SequenceProcessorHandler } from 'sdk/framework/processor';

describe('ThumbnailPreloadController', () => {
  let thumbnailPreloadController: ThumbnailPreloadController;
  let sequenceProcessorHandler: SequenceProcessorHandler;
  beforeEach(() => {
    thumbnailPreloadController = new ThumbnailPreloadController();
    sequenceProcessorHandler = new SequenceProcessorHandler(
      'Thumbnail Sequence Processor',
    );

    Object.assign(thumbnailPreloadController, {
      _sequenceProcessorHandler: sequenceProcessorHandler,
    });
  });

  describe('handleFileItems()', () => {
    it('should addProcessor of sequenceProcessorHandler', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'addProcessor')
        .mockImplementationOnce(() => {});
      thumbnailPreloadController.handleFileItems([1, 2, 3]);

      expect(sequenceProcessorHandler.addProcessor).toBeCalledTimes(3);
    });
  });
});
