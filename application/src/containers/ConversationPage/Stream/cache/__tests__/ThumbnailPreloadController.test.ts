/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 19:05:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ThumbnailPreloadController } from '../ThumbnailPreloadController';
import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { ItemFile } from 'sdk/module/item/entity';
import { EVENT_TYPES } from 'sdk/service/constants';

jest.mock('sdk/service/notificationCenter');

describe('ThumbnailPreloadController', () => {
  let thumbnailPreloadController: ThumbnailPreloadController;
  let sequenceProcessorHandler: SequenceProcessorHandler;
  let itemsObserver: Map<number, number>;
  beforeEach(() => {
    thumbnailPreloadController = new ThumbnailPreloadController();
    sequenceProcessorHandler = new SequenceProcessorHandler(
      'Thumbnail Sequence Processor',
    );
    itemsObserver = new Map();
    Object.assign(thumbnailPreloadController, {
      _sequenceProcessorHandler: sequenceProcessorHandler,
      _itemsObserver: itemsObserver,
    });
  });

  describe('clear()', () => {
    it('should call clear of sequenceProcessorHandler', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'clear')
        .mockImplementationOnce(() => {});
      const spyItemsObserverClear = jest.spyOn(itemsObserver, 'clear');
      thumbnailPreloadController.clear();
      expect(sequenceProcessorHandler.clear).toBeCalled();
      expect(spyItemsObserverClear).toBeCalled();
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

  describe('handleItemChanged()', () => {
    it('should call addProcessor when items in observers and changes', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'addProcessor')
        .mockImplementationOnce(() => {});
      itemsObserver.set(1, 1);
      itemsObserver.set(2, 2);

      const payload: NotificationEntityPayload<ItemFile> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: [],
        },
      };
      const spyItemsObserverDelete = jest.spyOn(itemsObserver, 'delete');
      thumbnailPreloadController.handleItemChanged(payload);
      expect(sequenceProcessorHandler.addProcessor).toBeCalledTimes(2);
      expect(spyItemsObserverDelete).toBeCalledTimes(2);
      expect(itemsObserver.size).toBe(0);
    });

    it('should not call addProcessor when items not in observers but changes', () => {
      jest
        .spyOn(sequenceProcessorHandler, 'addProcessor')
        .mockImplementationOnce(() => {});
      itemsObserver.clear();

      const payload: NotificationEntityPayload<ItemFile> = {
        type: EVENT_TYPES.UPDATE,
        body: {
          ids: [1, 2],
          entities: [],
        },
      };
      thumbnailPreloadController.handleItemChanged(payload);
      expect(sequenceProcessorHandler.addProcessor).toBeCalledTimes(0);
    });
  });
});
