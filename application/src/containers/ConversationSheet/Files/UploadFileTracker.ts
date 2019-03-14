/*
 * @Author: isaac.liu
 * @Date: 2019-02-25 16:28:07
 * Copyright © RingCentral. All rights reserved.
 */
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { notificationCenter, ENTITY, EVENT_TYPES } from 'sdk/service';
import FileItemModel from '@/store/models/FileItem';

let sharedTracker: UploadFileTracker;

class UploadFileTracker {
  static tracker() {
    if (!sharedTracker) {
      sharedTracker = new UploadFileTracker();
    }
    return sharedTracker;
  }

  static init() {
    UploadFileTracker.tracker();
  }

  private _idMap: Map<number, number> = new Map();

  constructor() {
    notificationCenter.on(`${ENTITY.ITEM}.*`, this._handleItemReplace);
  }

  private _handleItemReplace = (
    payload: NotificationEntityPayload<FileItemModel>,
  ) => {
    const { type } = payload;
    if (type === EVENT_TYPES.REPLACE) {
      const data: any = payload;
      const { ids, entities } = data.body;
      ids.forEach((looper: number) => {
        const newItem: FileItemModel = entities.get(looper);
        this._idMap.set(newItem.id, looper);
      });
    }
  }

  getMapID = (id: number) => {
    const mapID = this._idMap.get(id);
    if (typeof mapID !== 'undefined') {
      return mapID;
    }
    return id;
  }

  clear = (ids: number[]) => {
    ids.forEach((id: number) => this._idMap.delete(id));
  }
}

export { UploadFileTracker };
