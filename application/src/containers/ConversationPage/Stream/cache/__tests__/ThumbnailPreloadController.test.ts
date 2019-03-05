/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 19:05:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadController } from '../ThumbnailPreloadController';
import { SequenceProcessorHandler } from 'sdk/framework/processor';

jest.mock('sdk/service/notificationCenter');

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

  describe('clear()', () => {
    it('should call clear of sequenceProcessorHandler', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'clear')
        .mockImplementationOnce(() => {});
      thumbnailPreloadController.clear();

      expect(sequenceProcessorHandler.clear).toBeCalled();
    });
  });

  describe('preload()', () => {
    it('should addProcessor of sequenceProcessorHandler', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'addProcessor')
        .mockImplementationOnce(() => {});
      thumbnailPreloadController.preload([1, 2, 3]);

      expect(sequenceProcessorHandler.addProcessor).toBeCalledTimes(3);
    });
  });
});
