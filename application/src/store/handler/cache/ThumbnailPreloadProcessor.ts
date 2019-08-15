/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-04 19:10:13
 * Copyright © RingCentral. All rights reserved.
 */

import { IProcessor } from 'sdk/framework/processor';
import { ItemService, FileItemUtils } from 'sdk/module/item';
import { getThumbnailURLWithType, IMAGE_TYPE } from '@/common/getThumbnailURL';
import { Pal, DownloadItemInfo, IImageDownloadedListener } from 'sdk/pal';
import { mainLogger } from 'foundation/log';
import { RULE } from '@/common/generateModifiedImageURL';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils/entities';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import FileItemModel from '@/store/models/FileItem';

class ImageDownloadedListener implements IImageDownloadedListener {
  constructor(private _waiter: any) {}
  onSuccess(): void {
    this._waiter();
  }

  onFailure(): void {
    this._waiter();
  }

  onCancel(): void {
    this._waiter();
  }
}

class ThumbnailPreloadProcessor implements IProcessor {
  private _item: {
    id: number;
    url?: string;
    thumbnail?: boolean;
    count?: number;
    autoPreload?: boolean;
  };
  constructor(
    private _itemsObserver: Map<number, number>,
    item: {
      id: number;
      url?: string;
      thumbnail?: boolean;
      count?: number;
      autoPreload?: boolean;
    },
  ) {
    this._item = item;
  }

  protected preload(item: DownloadItemInfo) {
    return new Promise((resolve: any) => {
      Pal.instance
        .getImageDownloader()
        .download(item, new ImageDownloadedListener(resolve));
    });
  }

  async process(): Promise<boolean> {
    try {
      if (!this._item || this._item.id < 0) {
        return false;
      }

      const itemService = ServiceLoader.getInstance<ItemService>(
        ServiceConfig.ITEM_SERVICE,
      );
      const item = await itemService.getById(this._item.id);
      if (
        item &&
        !item.deactivated &&
        item.group_ids &&
        !item.group_ids.includes(
          getGlobalValue(GLOBAL_KEYS.CURRENT_CONVERSATION_ID),
        )
      ) {
        if (!FileItemUtils.isSupportPreview(item)) {
          return false;
        }

        const thumbnail = await getThumbnailURLWithType(
          new FileItemModel(item),
          this._item.count && this._item.count > 1
            ? RULE.SQUARE_IMAGE
            : RULE.RECTANGLE_IMAGE,
        );

        let url: string = '';
        switch (thumbnail.type) {
          case IMAGE_TYPE.THUMBNAIL_IMAGE:
            url = thumbnail.url;
            break;
          case IMAGE_TYPE.MODIFY_IMAGE:
            url = thumbnail.url;
            this._itemsObserver.set(
              item.id,
              this._item.count ? this._item.count : 1,
            );
            break;
          default:
            this._itemsObserver.set(
              item.id,
              this._item.count ? this._item.count : 1,
            );
            break;
        }

        if (url && url.length) {
          this._item.url = url;
          await this.preload(this._item);
        }
      }
    } catch (err) {
      mainLogger.warn(
        'ThumbnailPreloadProcessor: process(): error=',
        err.message,
      );
    }

    return true;
  }

  canContinue(): boolean {
    return true;
  }

  name(): string {
    return this._item.url ? this._item.url : this._item.id.toString();
  }
}

export { ThumbnailPreloadProcessor };
