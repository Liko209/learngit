/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ImageViewerProps } from './types';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import FileItemModel from '@/store/models/FileItem';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { ItemService } from 'sdk/module/item/service';
import { Pal } from 'sdk/pal';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

// same with dThor
const LARGE_IMAGE_SIZE = 2000;

class ImageViewerViewModel extends AbstractViewModel<ImageViewerProps> {
  @observable
  thumbnailSrc?: string;
  @observable
  private _initialWidth?: number;
  @observable
  private _initialHeight?: number;
  @observable
  private _buildThumbnailStatus: 'idle' | 'building' | 'fail' = 'idle';
  @observable
  private _largeRawImageURL?: string;

  constructor(props: ImageViewerProps) {
    super(props);
    this.thumbnailSrc = props.initialOptions.thumbnailSrc;
    this._initialWidth = props.initialOptions.initialWidth;
    this._initialHeight = props.initialOptions.initialHeight;
    this.props.setOnItemSwitchCb(this._clearThumbnailInfo);
    const itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    this.reaction(
      () => {
        const item = this.item;
        return item ? item.id : 0;
      },
      async (id: number) => {
        this._largeRawImageURL = undefined;
        const url = await itemService.getThumbsUrlWithSize(
          id,
          LARGE_IMAGE_SIZE,
          LARGE_IMAGE_SIZE,
        );
        this._largeRawImageURL = url;
      },
      { fireImmediately: true },
    );
  }

  @computed
  get imageInfo() {
    const item = this.item;
    if (FileItemUtils.isSupportShowRawImage(item)) {
      return {
        url: this._largeRawImageURL,
        width: item.origWidth,
        height: item.origHeight,
      };
    }
    if (FileItemUtils.isSupportPreview(item)) {
      if (item.thumbs) {
        return getMaxThumbnailURLInfo(item);
      }
      if (this._buildThumbnailStatus === 'fail') {
        return {
          url: '',
          width: 0,
          height: 0,
        };
      }
      if (this._buildThumbnailStatus === 'idle') {
        this._buildThumbnailStatus = 'building';
        const itemService = ServiceLoader.getInstance<ItemService>(
          ServiceConfig.ITEM_SERVICE,
        );
        itemService
          .getThumbsUrlWithSize(item.id, item.origWidth, item.origHeight)
          .then((url: string) => {
            Pal.instance.getImageDownloader().download(
              { url, id: item.id },
              {
                onSuccess: () => {},
                onFailure: () => {
                  this._buildThumbnailStatus = 'fail';
                },
                onCancel: () => {
                  this._buildThumbnailStatus = 'fail';
                },
              },
            );
          })
          .catch(() => {
            this._buildThumbnailStatus = 'fail';
          });
      }
    }
    return {
      url: undefined,
      width: 0,
      height: 0,
    };
  }

  @computed
  get imageUrl() {
    return this.imageInfo.url;
  }

  @computed
  get imageWidth() {
    return this.imageInfo.width || this._initialWidth;
  }

  @computed
  get imageHeight() {
    return this.imageInfo.height || this._initialHeight;
  }

  @computed
  get item(): FileItemModel {
    return getEntity(ENTITY_NAME.ITEM, this._getCurrentItemId());
  }

  private _clearThumbnailInfo = () => {
    this.thumbnailSrc = undefined;
    this._initialWidth = undefined;
    this._initialHeight = undefined;
    this._buildThumbnailStatus = 'idle';
  }

  private _getCurrentItemId = () => {
    return this.props.getCurrentItemId();
  }
}

export { ImageViewerViewModel };
