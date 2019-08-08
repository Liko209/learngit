/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ImageViewerProps } from './types';
import { computed, observable } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import FileItemModel from '@/store/models/FileItem';
import { getLargeRawImageURL } from '@/common/getThumbnailURL';

class ImageViewerViewModel extends AbstractViewModel<ImageViewerProps> {
  @observable
  thumbnailSrc?: string;
  @observable
  private _initialWidth?: number;
  @observable
  private _initialHeight?: number;
  @observable
  private _largeRawImageURL?: string;

  constructor(props: ImageViewerProps) {
    super(props);
    this.thumbnailSrc = props.initialOptions.thumbnailSrc;
    this._initialWidth = props.initialOptions.initialWidth;
    this._initialHeight = props.initialOptions.initialHeight;
    props.setOnItemSwitchCb(this._clearThumbnailInfo);
    this.reaction(
      () => {
        const item = this.item;
        return item ? item.id : 0;
      },
      async () => {
        this._largeRawImageURL = await getLargeRawImageURL(this.item);
      },
      { fireImmediately: true },
    );
  }

  @computed
  get imageInfo() {
    const item = this.item;
    if (FileItemUtils.isSupportPreview(item)) {
      return {
        url: this._largeRawImageURL,
        width: item.origWidth,
        height: item.origHeight,
      };
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
  }

  private _getCurrentItemId = () => this.props.getCurrentItemId()
}

export { ImageViewerViewModel };
