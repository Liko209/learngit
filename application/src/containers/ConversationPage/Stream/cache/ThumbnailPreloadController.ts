/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 12:20:43
 * Copyright © RingCentral. All rights reserved.
 */

import { SequenceProcessorHandler } from 'sdk/framework/processor';
import { ThumbnailPreloadProcessor } from './ThumbnailPreloadProcessor';
import notificationCenter, {
  NotificationEntityPayload,
} from 'sdk/service/notificationCenter';
import { SERVICE } from 'sdk/service/eventKey';
import { ItemNotification } from 'sdk/module/item';
import { TypeDictionary } from 'sdk/utils';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { ItemFile } from 'sdk/module/item/entity';
import { EVENT_TYPES } from 'sdk/service/constants';

class ThumbnailPreloadController {
  private _sequenceProcessorHandler: SequenceProcessorHandler = new SequenceProcessorHandler(
    'Thumbnail Sequence Processor',
  );

  private _itemsObserver: Map<number, number> = new Map();

  constructor() {
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this.clear();
    });
    notificationCenter.on(
      ItemNotification.getItemNotificationKey(TypeDictionary.TYPE_ID_FILE),
      (payload: NotificationEntityPayload<FileItem>) => {
        this._handleItemChanged(payload);
      },
    );
  }

  private _handleItemChanged = (
    payload: NotificationEntityPayload<ItemFile>,
  ) => {
    const { type } = payload;
    if (type === EVENT_TYPES.UPDATE) {
      const data: any = payload;
      const { ids } = data.body;
      ids.forEach((id: number) => {
        if (id > 0) {
          const found = this._itemsObserver.get(id);
          if (found) {
            this._itemsObserver.delete(id);
            this._addToProcessor(id, found);
          }
        }
      });
    }
  }

  clear() {
    this._sequenceProcessorHandler.clear();
  }

  preload(ids: number[]) {
    ids.forEach((id: number) => {
      this._addToProcessor(id, ids.length);
    });
  }

  private _addToProcessor(id: number, count: number) {
    this._sequenceProcessorHandler.addProcessor(
      new ThumbnailPreloadProcessor(this._itemsObserver, {
        id,
        count,
      }),
    );
  }
}

export { ThumbnailPreloadController };
