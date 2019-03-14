/*
 * @Author: Paynter Chen
 * @Date: 2019-03-04 15:28:45
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ImageViewerProps } from './types';
import _ from 'lodash';
import { computed, observable, action } from 'mobx';
import { QUERY_DIRECTION } from 'sdk/dao';
import { mainLogger } from 'sdk';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import FileItemModel from '@/store/models/FileItem';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { FileItem } from 'sdk/module/item/module/file/entity';
const PAGE_SIZE = 5;

class ImageViewerViewModel extends AbstractViewModel<ImageViewerProps> {
  @observable
  isLoadingMore: boolean = false;

  @observable
  private _thumbnailSrc?: string;
  @observable
  private _initialWidth?: number;
  @observable
  private _initialHeight?: number;

  constructor(props: ImageViewerProps) {
    super(props);
    this.thumbnailSrc = props.initialOptions.thumbnailSrc;
    this._initialWidth = props.initialOptions.initialWidth;
    this._initialHeight = props.initialOptions.initialHeight;
  }

  @computed
  get imageInfo() {
    const item = this.item;
    if (FileItemUtils.isSupportShowRawImage(item)) {
      return {
        url: item.versionUrl,
        width: item.origWidth,
        height: item.origHeight,
      };
    }
    if (FileItemUtils.isSupportPreview(item)) {
      return getMaxThumbnailURLInfo(item);
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
  get thumbnailSrc(): string | undefined {
    // consider add logic here: when raw image size > threshold, show it's thumbnail first
    // const thumbnailInfo = getMaxThumbnailURLInfo(this.item);
    return this._thumbnailSrc;
  }

  set thumbnailSrc(thumbnailSrc: string | undefined) {
    this._thumbnailSrc = thumbnailSrc;
  }

  @computed
  get item(): FileItemModel {
    return getEntity(ENTITY_NAME.FILE_ITEM, this._getCurrentItemId());
  }

  @computed
  get hasPrevious() {
    return this._getCurrentIndex() > 0;
  }

  @computed
  get hasNext() {
    return this._getCurrentIndex() < this.props.total - 1;
  }

  @action
  switchPreImage = () => {
    if (
      this.props.ids.length < 2 ||
      this.props.ids[0] === this._getCurrentItemId()
    ) {
      if (this.hasPrevious) {
        this._loadMore(QUERY_DIRECTION.OLDER).then((result: FileItem[]) => {
          result && this.switchPreImage();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchPreImage', {
          ids: this.props.ids,
          currentItemId: this._getCurrentItemId(),
        });
      }
    } else {
      this._clearThumbnailInfo();
      this.props.updateCurrentItemIndex(
        this._getCurrentIndex() - 1,
        this.props.ids[this._getItemIndex() - 1],
      );
    }
  }

  @action
  switchNextImage = () => {
    if (
      this.props.ids.length < 2 ||
      this.props.ids[this.props.ids.length - 1] === this._getCurrentItemId()
    ) {
      if (this.hasNext) {
        this._loadMore(QUERY_DIRECTION.NEWER).then((result: FileItem[]) => {
          result && this.switchNextImage();
        });
      } else {
        // should not come here
        mainLogger.warn('can not switchNextImage', {
          ids: this.props.ids,
          currentItemId: this._getCurrentItemId(),
        });
      }
    } else {
      this._clearThumbnailInfo();
      this.props.updateCurrentItemIndex(
        this._getCurrentIndex() + 1,
        this.props.ids[this._getItemIndex() + 1],
      );
    }
  }

  private _loadMore = async (
    direction: QUERY_DIRECTION,
  ): Promise<FileItem[] | null> => {
    if (this.isLoadingMore) {
      return null;
    }
    this.isLoadingMore = true;
    const result = await this.props.fetchData(direction, PAGE_SIZE);
    this.isLoadingMore = false;
    return result;
  }

  private _getItemIndex = (): number => {
    return this.props.ids.findIndex(
      (_id: number) => _id === this._getCurrentItemId(),
    );
  }

  private _clearThumbnailInfo = () => {
    this.thumbnailSrc = undefined;
    this._initialWidth = undefined;
    this._initialHeight = undefined;
  }

  private _getCurrentItemId = () => {
    return this.props.getCurrentItemId();
  }

  private _getCurrentIndex = () => {
    return this.props.getCurrentIndex();
  }
}

export { ImageViewerViewModel };
